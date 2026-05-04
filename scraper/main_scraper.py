import asyncio
from playwright.async_api import async_playwright
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

async def scrape_career_pages():
    """
    Scrapes jobs from official career pages.
    Add configuration objects to the 'targets' list to support more companies.
    """
    targets = [
        {
            "name": "AcmeCorp", 
            "url": "https://example.com/careers", 
            "selector": ".job-listing", 
            "title": "h3.job-title", 
            "desc": ".job-description", 
            "loc": ".job-location", 
            "link": "a.apply-link"
        },
        # You can add more targets here.
    ]

    print("Staring scraper background job...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Spoof user-agent to avoid immediate bot detection
        await page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        })

        for company in targets:
            try:
                print(f"Scraping {company['name']} from {company['url']}...")
                await page.goto(company['url'])
                
                # Add a delay to avoid aggressive scraping
                await page.wait_for_timeout(3000)

                # Wait for content to load dynamically
                await page.wait_for_selector(company["selector"], timeout=15000)
                
                job_elements = await page.query_selector_all(company["selector"])
                print(f"Found {len(job_elements)} jobs at {company['name']}")

                for elem in job_elements:
                    title_elem = await elem.query_selector(company["title"])
                    desc_elem = await elem.query_selector(company["desc"])
                    loc_elem = await elem.query_selector(company["loc"])
                    link_elem = await elem.query_selector(company["link"])

                    if title_elem and desc_elem and link_elem:
                        job_data = {
                            "company_name": company['name'],
                            "job_title": (await title_elem.inner_text()).strip(),
                            "description": (await desc_elem.inner_text()).strip(),
                            "location": (await loc_elem.inner_text()).strip() if loc_elem else "Remote/Unspecified",
                            "apply_link": await link_elem.get_attribute("href")
                        }
                        
                        # Handle relative links
                        if job_data["apply_link"] and job_data["apply_link"].startswith("/"):
                            job_data["apply_link"] = company['url'] + job_data["apply_link"]

                        print(f"Extracted job: {job_data['job_title']}")
                        
                        if supabase:
                            # Inserting into DB. For production, consider using UPSERT to avoid dupes.
                            print("Saving to database...")
                            supabase.table("jobs").insert(job_data).execute()
                            
            except Exception as e:
                print(f"Failed to scrape {company['name']}: {e}")
        
        await browser.close()
        print("Scraper job completed.")

if __name__ == "__main__":
    asyncio.run(scrape_career_pages())
