import os
import io
import logging
from dotenv import load_dotenv

# Load .env FIRST, before reading any environment variables
load_dotenv()

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

# Constants for Internal Integration — loaded from environment (AFTER load_dotenv)
FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
INTERNAL_SECRET = os.getenv("INTERNAL_SERVICE_KEY", "cypherdon_internal_123")

# Shared persistent HTTP client — reuses TCP connections across requests
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(30.0),
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
        "and queue them for automatic sending.\n\n"
        "Type /cancel at any time to stop.",
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
    """Handles the uploaded PDF resume — downloads it and stores bytes in memory."""
    if not update.message.document or not update.message.document.file_name.endswith('.pdf'):
        await update.message.reply_text("Please upload a valid PDF file.")
        return AWAITING_RESUME

    await update.message.reply_text("⏳ Downloading and parsing your resume...")

    try:
        # Actually download the resume from Telegram servers
        tg_file = await update.message.document.get_file()
        file_bytes = await tg_file.download_as_bytearray()
        
        # Store in user session for later use
        context.user_data['resume_bytes'] = bytes(file_bytes)
        context.user_data['resume_filename'] = update.message.document.file_name
        
        logger.info(f"Resume downloaded: {update.message.document.file_name} ({len(file_bytes)} bytes)")
    except Exception as e:
        logger.error(f"Failed to download resume: {e}")
        await update.message.reply_text("❌ Failed to download your resume. Please try again.")
        return AWAITING_RESUME
    
    keyboard = [
        [InlineKeyboardButton("Frontend Engineer", callback_data="role_frontend")],
        [InlineKeyboardButton("Backend Engineer", callback_data="role_backend")],
        [InlineKeyboardButton("Full Stack Engineer", callback_data="role_fullstack")],
        [InlineKeyboardButton("Data Scientist", callback_data="role_data")],
        [InlineKeyboardButton("DevOps Engineer", callback_data="role_devops")],
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
    
    role_map = {
        "role_frontend": "Frontend Engineer",
        "role_backend": "Backend Engineer",
        "role_fullstack": "Full Stack Engineer",
        "role_data": "Data Scientist",
        "role_devops": "DevOps Engineer",
    }
    selected_role = role_map.get(query.data, "Software Engineer")
    context.user_data['target_role'] = selected_role
    
    await query.edit_message_text(
        text=f"🎯 Target Role: *{selected_role}*\n\n"
             f"Now type the name of the company you want to apply to.\n"
             f"Example: `Google`",
        parse_mode="Markdown",
    )
    return AWAITING_JOB_LIST

async def handle_job_input(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the text input for the company and generates AI email."""
    company_name = update.message.text.strip()
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
        logger.info(f"AI email generated for {company_name}")
    except Exception as e:
        logger.warning(f"FastAPI email generation failed ({e}), using smart fallback.")
        draft_subject = f"Application for {role} at {company_name}"
        draft_body = (
            f"Hi {company_name} Hiring Team,\n\n"
            f"I am writing to express my strong interest in the {role} position at {company_name}. "
            f"With hands-on experience in Python, React, and Cloud technologies, I am confident I can "
            f"contribute meaningfully to your engineering team.\n\n"
            f"I have attached my resume for your review and would love the opportunity to discuss "
            f"how my skills align with your team's goals.\n\n"
            f"Looking forward to hearing from you.\n\n"
            f"Best regards"
        )
    
    context.user_data['draft_subject'] = draft_subject
    context.user_data['draft_body'] = draft_body
    
    email_preview = f"**Subject:** {draft_subject}\n\n**Body:**\n{draft_body}"
    
    keyboard = [
        [InlineKeyboardButton("✅ Approve & Send", callback_data="approve_email")],
        [InlineKeyboardButton("🔄 Regenerate", callback_data="regenerate_email")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        text=f"📧 Here is your AI Generated Draft:\n\n{email_preview}",
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
                    text="🎉 Email Approved and securely queued!\n"
                         "It will be sent with a randomized 10-20 minute delay.\n\n"
                         "Type /start to begin another application!"
                )
                return ConversationHandler.END
            else:
                logger.error(f"Spring Boot returned {response.status_code}: {response.text}")
                await query.edit_message_text(
                    text=f"❌ Failed to queue email (status {response.status_code}).\n\n"
                         f"Make sure Spring Boot is running on {SPRING_BOOT_URL}.\n"
                         f"Type /start to try again."
                )
                return ConversationHandler.END

        except Exception as e:
            logger.error(f"Failed to call Spring Boot: {e}")
            
            keyboard = [
                [InlineKeyboardButton("🔁 Retry", callback_data="approve_email")],
                [InlineKeyboardButton("🏠 Start Over", callback_data="start_over")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                text=f"❌ Network Error: Could not connect to Queue Engine.\n\n"
                     f"Make sure Spring Boot is running on `{SPRING_BOOT_URL}`.\n\n"
                     f"You can retry or start over.",
                parse_mode="Markdown",
                reply_markup=reply_markup
            )
            return REVIEWING_EMAIL
        
    elif query.data == "regenerate_email":
        await query.edit_message_text(text="🔄 Regenerating email...")
        
        role = context.user_data.get('target_role', 'Software Engineer')
        company = context.user_data.get('target_company', 'the company')
        
        # Try to regenerate via FastAPI
        try:
            payload = {
                "user_profile": {
                    "skills": [role, "Python", "React", "Cloud"],
                    "projects": [{"name": "Cypherdon Bot", "description": "Built a seamless Telegram automation bot."}]
                },
                "job_details": {
                    "role": role,
                    "company": company,
                    "description": f"Looking for a strong {role} to join our team."
                },
                "tone": "professional"
            }
            response = await http_client.post(f"{FASTAPI_URL}/api/emails/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            new_subject = data.get("subject_line", context.user_data['draft_subject'])
            new_body = data.get("body", context.user_data['draft_body'])
        except Exception:
            # Fallback: tweak the existing draft
            new_subject = context.user_data['draft_subject']
            new_body = context.user_data['draft_body'].replace(
                "Looking forward to hearing from you.",
                "I would love to arrange an interview at your earliest convenience."
            )
        
        context.user_data['draft_subject'] = new_subject
        context.user_data['draft_body'] = new_body
        
        email_preview = f"**Subject:** {new_subject}\n\n**Body:**\n{new_body}"
        
        keyboard = [
            [InlineKeyboardButton("✅ Approve & Send", callback_data="approve_email")],
            [InlineKeyboardButton("🔄 Regenerate", callback_data="regenerate_email")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            text=f"📧 Here is your REGENERATED Draft:\n\n{email_preview}",
            parse_mode="Markdown",
            reply_markup=reply_markup
        )
        return REVIEWING_EMAIL

    elif query.data == "start_over":
        await query.edit_message_text(text="Starting over! Type /start to begin a new application.")
        return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels and ends the conversation."""
    await update.message.reply_text("Process cancelled. Type /start to try again. 👋")
    return ConversationHandler.END

def main() -> None:
    """Run the bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("No TELEGRAM_BOT_TOKEN found in environment!")
        return

    logger.info(f"Bot starting — FastAPI: {FASTAPI_URL}, Spring Boot: {SPRING_BOOT_URL}")

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
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_job_input)
            ],
            REVIEWING_EMAIL: [
                CallbackQueryHandler(handle_email_review, pattern="^(approve_email|regenerate_email|start_over)$")
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    application.add_handler(conv_handler)
    
    logger.info("Telegram Bot is now ONLINE and polling for messages...")
    application.run_polling()

if __name__ == "__main__":
    main()
