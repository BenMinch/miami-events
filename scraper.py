import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime

# --- CONFIGURATION ---
OUTPUT_FILE = "miami_events.json"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def scrape_coral_gables():
    """Scrapes events from Coral Gables website"""
    print("Scraping Coral Gables...")
    url = "https://www.coralgables.com/events-calendar?page=0"
    events = []
    
    try:
        response = requests.get(url, headers=HEADERS)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # NOTE: these selectors are based on common patterns but MUST be inspected 
        # on the live site as they change frequently.
        # Look for the container that holds individual event cards
        event_cards = soup.find_all('article') # Generic fallback
        
        for card in event_cards:
            try:
                title = card.find('h3').get_text(strip=True)
                # Date parsing is often the hardest part of scraping
                date_text = card.find(class_='date').get_text(strip=True) 
                link = "https://www.coralgables.com" + card.find('a')['href']
                
                events.append({
                    "title": title,
                    "date": date_text, # You may need to format this to YYYY-MM-DD
                    "city": "Coral Gables",
                    "url": link,
                    "source": "Coral Gables Official"
                })
            except AttributeError:
                continue
    except Exception as e:
        print(f"Error scraping Coral Gables: {e}")
        
    return events

def scrape_coconut_grove():
    """Scrapes events from Coconut Grove website"""
    print("Scraping Coconut Grove...")
    url = "https://calendar.coconutgrove.com/"
    events = []
    
    try:
        response = requests.get(url, headers=HEADERS)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Coconut Grove usually lists events in a grid or list
        calendar_items = soup.select('.event-item') # Example selector
        
        for item in calendar_items:
            try:
                title = item.select_one('.event-title').get_text(strip=True)
                date = item.select_one('.event-date').get_text(strip=True)
                link = item.find('a')['href']
                
                events.append({
                    "title": title,
                    "date": date,
                    "city": "Coconut Grove",
                    "url": link,
                    "source": "Coconut Grove BID"
                })
            except AttributeError:
                continue
    except Exception as e:
        print(f"Error scraping Coconut Grove: {e}")
        
    return events

def scrape_miami_cheap():
    """Scrapes events from Miami On The Cheap"""
    print("Scraping Miami On The Cheap...")
    url = "https://miamionthecheap.com/miami-dade-news-and-events/"
    events = []
    
    try:
        response = requests.get(url, headers=HEADERS)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # This site is often a blog list
        list_items = soup.select('.entry-content li')
        
        for item in list_items:
            text = item.get_text(strip=True)
            # Basic filtering to ensure it looks like an event
            if " am " in text.lower() or " pm " in text.lower():
                events.append({
                    "title": text[:50] + "...", # Truncate long text
                    "date": datetime.now().strftime("%Y-%m-%d"), # Defaulting to today for generic lists
                    "city": "Miami",
                    "url": url,
                    "source": "Miami On The Cheap"
                })
    except Exception as e:
        print(f"Error scraping Miami On The Cheap: {e}")
        
    return events

def main():
    all_events = []
    
    # 1. Run Scrapers
    all_events.extend(scrape_coral_gables())
    all_events.extend(scrape_coconut_grove())
    all_events.extend(scrape_miami_cheap())
    
    # 2. Save Data
    print(f"Found {len(all_events)} total events.")
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(all_events, f, indent=2)
        
    print(f"Successfully saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()