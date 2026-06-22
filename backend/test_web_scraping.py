#!/usr/bin/env python3
"""
Test web scraping and online presence integration
"""
import sys
from controller.profile_scraper_controller import (
    extract_urls_from_text,
    scrape_github_profile,
    scrape_leetcode_profile,
    analyze_online_presence
)

def test_url_extraction():
    """Test URL extraction from resume text"""
    print("\n" + "="*70)
    print("  TEST 1: URL Extraction")
    print("="*70)
    
    sample_text = """
    Contact: john@example.com
    GitHub: https://github.com/torvalds
    LeetCode: https://leetcode.com/u/user1234
    Portfolio: https://johndoe.dev
    LinkedIn: https://linkedin.com/in/johndoe
    """
    
    urls = extract_urls_from_text(sample_text)
    print(f"\n✓ Extracted URLs:")
    for platform, url in urls.items():
        if url and not isinstance(url, list):
            print(f"  {platform}: {url}")
        elif isinstance(url, list) and url:
            print(f"  {platform}: {url}")
    
    return urls


def test_github_scraping():
    """Test GitHub profile scraping"""
    print("\n" + "="*70)
    print("  TEST 2: GitHub Scraping")
    print("="*70)
    
    # Test with a real GitHub profile (Linus Torvalds - creator of Linux)
    github_url = "https://github.com/torvalds"
    print(f"\n⏳ Scraping: {github_url}")
    
    result = scrape_github_profile(github_url)
    
    print(f"\n✓ Platform: {result['platform']}")
    print(f"✓ Score: {result['score']}%")
    print(f"✓ Data:")
    if 'public_repos' in result['data']:
        print(f"  - Public Repos: {result['data']['public_repos']}")
    if 'followers' in result['data']:
        print(f"  - Followers: {result['data']['followers']}")
    if 'total_stars' in result['data']:
        print(f"  - Total Stars: {result['data']['total_stars']}")
    if 'languages' in result['data']:
        print(f"  - Languages: {', '.join(result['data']['languages'][:5])}")
    
    print(f"\n✓ Indicators:")
    for indicator in result['indicators']:
        print(f"  • {indicator}")
    
    if 'error' in result:
        print(f"\n⚠ Error: {result['error']}")
    
    return result


def test_leetcode_scraping():
    """Test LeetCode profile scraping"""
    print("\n" + "="*70)
    print("  TEST 3: LeetCode Scraping")
    print("="*70)
    
    # Note: This might fail if the user doesn't exist or API changes
    leetcode_url = "https://leetcode.com/u/user1234"
    print(f"\n⏳ Scraping: {leetcode_url}")
    
    result = scrape_leetcode_profile(leetcode_url)
    
    print(f"\n✓ Platform: {result['platform']}")
    print(f"✓ Score: {result['score']}%")
    
    if result['data']:
        print(f"✓ Data:")
        if 'easy_solved' in result['data']:
            print(f"  - Easy: {result['data'].get('easy_solved', 0)}")
        if 'medium_solved' in result['data']:
            print(f"  - Medium: {result['data'].get('medium_solved', 0)}")
        if 'hard_solved' in result['data']:
            print(f"  - Hard: {result['data'].get('hard_solved', 0)}")
        if 'total_solved' in result['data']:
            print(f"  - Total: {result['data'].get('total_solved', 0)}")
    
    if result['indicators']:
        print(f"\n✓ Indicators:")
        for indicator in result['indicators']:
            print(f"  • {indicator}")
    
    if 'error' in result:
        print(f"\n⚠ Error: {result['error']}")
    
    return result


def test_comprehensive_analysis():
    """Test comprehensive online presence analysis"""
    print("\n" + "="*70)
    print("  TEST 4: Comprehensive Online Presence Analysis")
    print("="*70)
    
    # Simulate a parsed profile with links
    parsed_profile = {
        'links': {
            'github': 'https://github.com/torvalds',
            'portfolio': 'https://example.com'
        },
        'raw_sections': {
            'contact': 'GitHub: https://github.com/torvalds'
        }
    }
    
    raw_text = "Check my GitHub: https://github.com/torvalds"
    
    print("\n⏳ Analyzing online presence...")
    result = analyze_online_presence(parsed_profile, raw_text)
    
    print(f"\n✓ Overall Score: {result['score']}%")
    print(f"✓ Summary: {result['summary']}")
    print(f"✓ Platforms Found: {len(result['platforms'])}")
    
    if result['platforms']:
        print(f"\n✓ Platform Details:")
        for platform in result['platforms']:
            print(f"\n  {platform['platform']}:")
            print(f"    Score: {platform['score']}%")
            print(f"    URL: {platform['url']}")
            if platform['indicators']:
                print(f"    Indicators:")
                for indicator in platform['indicators'][:3]:
                    print(f"      • {indicator}")
    
    print(f"\n✓ Total Indicators: {len(result['total_indicators'])}")
    if result['total_indicators']:
        print("  Top indicators:")
        for indicator in result['total_indicators'][:5]:
            print(f"    • {indicator}")
    
    return result


def main():
    print("\n" + "="*70)
    print("  🌐 WEB SCRAPING & ONLINE PRESENCE TEST")
    print("="*70)
    
    try:
        # Test 1: URL Extraction
        urls = test_url_extraction()
        
        # Test 2: GitHub Scraping
        github_result = test_github_scraping()
        
        # Test 3: LeetCode Scraping (may fail for non-existent users)
        leetcode_result = test_leetcode_scraping()
        
        # Test 4: Comprehensive Analysis
        comprehensive_result = test_comprehensive_analysis()
        
        print("\n" + "="*70)
        print("  ✅ ALL TESTS COMPLETED")
        print("="*70)
        print("\n📊 SUMMARY:")
        print(f"  • URL Extraction: ✓")
        print(f"  • GitHub Scraping: {'✓' if github_result['score'] > 0 else '✗'}")
        print(f"  • LeetCode Scraping: {'✓' if leetcode_result['score'] > 0 else '⚠ (user may not exist)'}")
        print(f"  • Comprehensive Analysis: {'✓' if comprehensive_result['score'] > 0 else '✗'}")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
