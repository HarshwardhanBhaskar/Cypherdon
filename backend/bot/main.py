import os
import logging
from dotenv import load_dotenv
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
    ContextTypes,
    ConversationHandler,
)

# Constants for Internal Integration — loaded from environment
FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
INTERNAL_SECRET = os.getenv("INTERNAL_SERVICE_KEY", "cypherdon_internal_123")

# Load env variables (for TELEGRAM_BOT_TOKEN)
load_dotenv()

# Shared persistent HTTP client — reuses TCP connections across requests
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(15.0),
    limits=httpx.Limits(max_connections=10, max_keepalive_connections=5)
)

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Conversation States
AWAITING_RESUME, SELECTING_ROLE, AWAITING_JOB_LIST, REVIEWING_EMAIL = range(4)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Entry point for the bot."""
    keyboard = [
        [InlineKeyboardButton("🚀 Start Automation", callback_data="start_automation")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Welcome to the Cypherdon Automation Bot! 🤖\n\n"
        "I can help you parse your resume, generate personalized cold emails, "
        "and queue them for automatic sending.",
        reply_markup=reply_markup
    )
    return AWAITING_RESUME

async def prompt_resume(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Triggered by 'Start Automation' button."""
    query = update.callback_query
    await query.answer()
    
    await query.edit_message_text(text="Great! Please upload your Resume (PDF format).")
    return AWAITING_RESUME

async def handle_resume(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the uploaded PDF resume."""
    if not update.message.document or not update.message.document.file_name.endswith('.pdf'):
        await update.message.reply_text("Please upload a valid PDF file.")
        return AWAITING_RESUME

    # In a real app, you would download it:
    # file = await update.message.document.get_file()
    # await file.download_to_drive("temp_resume.pdf")
    
    keyboard = [
        [InlineKeyboardButton("Frontend Engineer", callback_data="role_frontend")],
        [InlineKeyboardButton("Backend Engineer", callback_data="role_backend")],
        [InlineKeyboardButton("Data Scientist", callback_data="role_data")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "✅ Resume received and parsed!\n\nWhat is your Target Role?",
        reply_markup=reply_markup
    )
    return SELECTING_ROLE

async def handle_role_selection(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the role button click."""
    query = update.callback_query
    await query.answer()
    
    # Extract role from callback_data (e.g. 'role_frontend' -> 'Frontend Engineer')
    role_map = {
        "role_frontend": "Frontend Engineer",
        "role_backend": "Backend Engineer",
        "role_data": "Data Scientist"
    }
    selected_role = role_map.get(query.data, "Software Engineer")
    context.user_data['target_role'] = selected_role
    
    keyboard = [
        [InlineKeyboardButton("Provide Target Company", callback_data="upload_job")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text=f"Target Role set to: **{selected_role}**\n\nNow, let's target a specific company.",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )
    return AWAITING_JOB_LIST

async def prompt_job(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Prompt user to type a target company name."""
    query = update.callback_query
    await query.answer()
    
    await query.edit_message_text(text="Please type the name of the company you want to apply to (e.g., 'Google'):")
    return AWAITING_JOB_LIST

async def handle_job_input(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the text input for the company."""
    company_name = update.message.text
    context.user_data['target_company'] = company_name
    role = context.user_data.get('target_role', 'Software Engineer')
    
    await update.message.reply_text("🤖 Generating AI Cold Email via FastAPI... please wait.")
    
    # Hit FastAPI /emails/generate
    try:
        payload = {
            "user_profile": {
                "skills": [role, "Python", "React", "Cloud"],
                "projects": [{"name": "Cypherdon Bot", "description": "Built a seamless Telegram automation bot."}]
            },
            "job_details": {
                "role": role,
                "company": company_name,
                "description": f"Looking for a strong {role} to join our team."
            },
            "tone": "startup"
        }
        response = await http_client.post(f"{FASTAPI_URL}/api/emails/generate", json=payload)
        response.raise_for_status()
        data = response.json()
            
            draft_subject = data.get("subject_line", "Application")
            draft_body = data.get("body", "Error generating body.")
            
    except Exception as e:
        logger.error(f"Failed to call FastAPI: {e}")
        draft_subject = f"Application for {role} at {company_name}"
        draft_body = "We failed to reach the AI Engine. Showing fallback draft."
    
    context.user_data['draft_subject'] = draft_subject
    context.user_data['draft_body'] = draft_body
    
    email_preview = f"**Subject:** {draft_subject}\n\n**Body:**\n{draft_body}"
    
    keyboard = [
        [InlineKeyboardButton("✅ Approve & Send", callback_data="approve_email")],
        [InlineKeyboardButton("🔄 Regenerate", callback_data="regenerate_email")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        text=f"Here is your AI Generated Draft:\n\n{email_preview}",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )
    return REVIEWING_EMAIL

async def handle_email_review(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles Approve or Regenerate."""
    query = update.callback_query
    await query.answer()
    
    if query.data == "approve_email":
        await query.edit_message_text(text="⏳ Queuing email via Spring Boot...")
        
        # Hit Spring Boot /emails/queue
        try:
            headers = {"X-Internal-Secret": INTERNAL_SECRET}
            payload = {
                "recipientEmail": "recruiter@example.com",
                "subject": context.user_data.get('draft_subject'),
                "body": context.user_data.get('draft_body'),
                "resumeUrl": "https://cypherdon.com/resumes/demo.pdf",
                "isPaidUser": True
            }
            response = await http_client.post(f"{SPRING_BOOT_URL}/api/emails/queue", json=payload, headers=headers)
                
                if response.status_code == 200:
                    await query.edit_message_text(
                        text="🎉 Email Approved and securely queued by the Spring Boot scheduler!\n"
                             "It will be sent with a randomized 10-20 minute delay.\n\n"
                             "Type /start to begin another application!"
                    )
                else:
                    await query.edit_message_text(f"❌ Failed to queue email: {response.text}")
                    
        except Exception as e:
            logger.error(f"Failed to call Spring Boot: {e}")
            await query.edit_message_text(f"❌ Network Error connecting to Queue Engine.")
            
        return ConversationHandler.END
        
    elif query.data == "regenerate_email":
        # Just mock a slight change for demonstration
        new_body = context.user_data['draft_body'].replace("Let's chat", "I would love to arrange an interview.")
        email_preview = f"**Subject:** {context.user_data['draft_subject']}\n\n**Body:**\n{new_body}"
        
        keyboard = [
            [InlineKeyboardButton("✅ Approve & Send", callback_data="approve_email")],
            [InlineKeyboardButton("🔄 Regenerate", callback_data="regenerate_email")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            text=f"Here is your REGENERATED Draft:\n\n{email_preview}",
            parse_mode="Markdown",
            reply_markup=reply_markup
        )
        return REVIEWING_EMAIL

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels and ends the conversation."""
    await update.message.reply_text("Process cancelled. Type /start to try again.")
    return ConversationHandler.END

def main() -> None:
    """Run the bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("No TELEGRAM_BOT_TOKEN found in environment!")
        return

    application = ApplicationBuilder().token(token).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            AWAITING_RESUME: [
                CallbackQueryHandler(prompt_resume, pattern="^start_automation$"),
                MessageHandler(filters.Document.PDF, handle_resume)
            ],
            SELECTING_ROLE: [
                CallbackQueryHandler(handle_role_selection, pattern="^role_")
            ],
            AWAITING_JOB_LIST: [
                CallbackQueryHandler(prompt_job, pattern="^upload_job$"),
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_job_input)
            ],
            REVIEWING_EMAIL: [
                CallbackQueryHandler(handle_email_review, pattern="^(approve_email|regenerate_email)$")
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    application.add_handler(conv_handler)
    
    logger.info("Starting Telegram Bot Polling...")
    application.run_polling()

if __name__ == "__main__":
    main()
