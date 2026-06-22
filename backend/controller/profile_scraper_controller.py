"""
Profile Scraper Controller
Extracts data from GitHub, LinkedIn, LeetCode, Codeforces, Portfolio, etc.
"""
import re
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import json


def extract_urls_from_text(text: str) -> Dict[str, str]:
    """Extract all profile URLs from text"""
    urls = {
        'github': None,
        'linkedin': None,
        'leetcode': None,
        'codeforces': None,
        'codechef': None,
        'hackerrank': None,
        'portfolio': None,
        'other': []
    }
    
    if not text:
        return urls
    
    # Domains to exclude (not portfolios)
    excluded_domains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
        'protonmail.com', 'icloud.com', 'mail.com', 'aol.com',
        'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'youtube.com', 'reddit.com', 'stackoverflow.com', 'medium.com'
    ]
    
    # Find all URLs in the text (with or without https://)
    url_pattern = r'(?:https?://)?(?:www\.)?[\w\-\.]+\.[\w]{2,}(?:/[\w\-\./?%&=]*)?'
    found_urls = re.findall(url_pattern, text, re.IGNORECASE)
    
    for url in found_urls:
        # Add https:// if missing
        if not url.startswith('http'):
            url = f'https://{url}'
        
        url_lower = url.lower()
        
        # Check if it's an excluded domain
        is_excluded = any(domain in url_lower for domain in excluded_domains)
        if is_excluded:
            continue
        
        # Categorize the URL
        if 'github.com' in url_lower and not urls['github']:
            urls['github'] = url
        elif 'linkedin.com' in url_lower and not urls['linkedin']:
            urls['linkedin'] = url
        elif 'leetcode.com' in url_lower and not urls['leetcode']:
            urls['leetcode'] = url
        elif 'codeforces.com' in url_lower and not urls['codeforces']:
            urls['codeforces'] = url
        elif 'codechef.com' in url_lower and not urls['codechef']:
            urls['codechef'] = url
        elif 'hackerrank.com' in url_lower and not urls['hackerrank']:
            urls['hackerrank'] = url
        else:
            # Likely a portfolio or personal website
            # Additional check: must not be a known platform
            known_platforms = ['github', 'linkedin', 'leetcode', 'codeforces', 'codechef', 'hackerrank']
            if not any(platform in url_lower for platform in known_platforms):
                if urls['portfolio'] is None:
                    urls['portfolio'] = url
                else:
                    urls['other'].append(url)
    
    return urls


def scrape_github_profile(github_url: str) -> Dict:
    """Scrape GitHub profile data"""
    result = {
        'platform': 'GitHub',
        'url': github_url,
        'score': 0,
        'data': {},
        'indicators': []
    }
    
    try:
        # Extract username from URL
        username_match = re.search(r'github\.com/([^/\?]+)', github_url)
        if not username_match:
            return result
        
        username = username_match.group(1)
        
        # Try to get data from GitHub API
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        # Get user info
        user_response = requests.get(f'https://api.github.com/users/{username}', headers=headers, timeout=5)
        if user_response.status_code == 200:
            user_data = user_response.json()
            result['data']['public_repos'] = user_data.get('public_repos', 0)
            result['data']['followers'] = user_data.get('followers', 0)
            result['data']['following'] = user_data.get('following', 0)
            result['data']['bio'] = user_data.get('bio', '')
            
            # Get repositories (top 10)
            repos_response = requests.get(f'https://api.github.com/users/{username}/repos?sort=updated&per_page=10', headers=headers, timeout=5)
            if repos_response.status_code == 200:
                repos = repos_response.json()
                result['data']['repositories'] = []
                total_stars = 0
                languages = set()
                
                if isinstance(repos, list):
                    for repo in repos:
                        if isinstance(repo, dict) and not repo.get('fork'):  # Count only original repos
                            stars = repo.get('stargazers_count', 0) or 0
                            total_stars += stars
                            lang = repo.get('language')
                            if lang:
                                languages.add(lang)
                            
                            desc = repo.get('description', '') or ''
                            result['data']['repositories'].append({
                                'name': repo.get('name', 'Unknown'),
                                'description': str(desc)[:100] if desc else '',
                                'stars': stars,
                                'language': lang,
                                'url': repo.get('html_url', '')
                            })
                
                result['data']['total_stars'] = total_stars
                result['data']['languages'] = list(languages)
                
                # Scoring
                score = 50  # Base score
                score += min(result['data']['public_repos'] * 2, 20)  # Up to 20 points for repos
                score += min(result['data']['followers'] * 1, 15)  # Up to 15 points for followers
                score += min(total_stars * 3, 15)  # Up to 15 points for stars
                result['score'] = min(score, 100)
                
                # Indicators
                if result['data']['public_repos'] > 10:
                    result['indicators'].append(f"{result['data']['public_repos']} public repositories")
                if result['data']['followers'] > 5:
                    result['indicators'].append(f"{result['data']['followers']} GitHub followers")
                if total_stars > 5:
                    result['indicators'].append(f"{total_stars} total stars across repositories")
                if len(languages) > 3:
                    result['indicators'].append(f"Proficient in {len(languages)} languages: {', '.join(list(languages)[:5])}")
                elif len(languages) > 0:
                    result['indicators'].append(f"Uses {len(languages)} programming language(s): {', '.join(list(languages)[:3])}")
        
    except Exception as e:
        result['error'] = str(e)
    
    return result


def scrape_leetcode_profile(leetcode_url: str) -> Dict:
    """Scrape LeetCode profile data"""
    result = {
        'platform': 'LeetCode',
        'url': leetcode_url,
        'score': 0,
        'data': {},
        'indicators': []
    }
    
    try:
        username_match = re.search(r'leetcode\.com/(?:u/)?([^/\?]+)', leetcode_url)
        if not username_match:
            return result
        
        username = username_match.group(1)
        
        # LeetCode GraphQL API
        graphql_url = 'https://leetcode.com/graphql'
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
        
        query = """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                profile {
                    ranking
                    reputation
                }
            }
        }
        """
        
        response = requests.post(
            graphql_url,
            json={'query': query, 'variables': {'username': username}},
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('data', {}).get('matchedUser')
            
            if user:
                result['data']['username'] = user.get('username')
                
                # Parse submission stats
                submissions = user.get('submitStats', {}).get('acSubmissionNum', [])
                for item in submissions:
                    difficulty = item.get('difficulty', '').lower()
                    count = item.get('count', 0)
                    result['data'][f'{difficulty}_solved'] = count
                
                # Calculate score
                easy = result['data'].get('easy_solved', 0)
                medium = result['data'].get('medium_solved', 0)
                hard = result['data'].get('hard_solved', 0)
                total = easy + medium + hard
                
                result['data']['total_solved'] = total
                
                score = 40  # Base score
                score += min(easy * 0.3, 10)
                score += min(medium * 0.5, 25)
                score += min(hard * 1, 25)
                result['score'] = min(score, 100)
                
                # Indicators
                if total > 50:
                    result['indicators'].append(f"Solved {total} LeetCode problems")
                if hard > 10:
                    result['indicators'].append(f"Solved {hard} hard problems")
                if medium > 30:
                    result['indicators'].append(f"Strong problem-solving: {medium} medium problems")
                
                ranking = user.get('profile', {}).get('ranking')
                if ranking:
                    result['data']['ranking'] = ranking
                    if ranking < 100000:
                        result['indicators'].append(f"LeetCode Ranking: {ranking:,}")
    
    except Exception as e:
        result['error'] = str(e)
    
    return result


def scrape_codeforces_profile(codeforces_url: str) -> Dict:
    """Scrape Codeforces profile data"""
    result = {
        'platform': 'Codeforces',
        'url': codeforces_url,
        'score': 0,
        'data': {},
        'indicators': []
    }
    
    try:
        username_match = re.search(r'codeforces\.com/profile/([^/\?]+)', codeforces_url)
        if not username_match:
            return result
        
        username = username_match.group(1)
        
        # Codeforces API
        api_url = f'https://codeforces.com/api/user.info?handles={username}'
        response = requests.get(api_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'OK' and data.get('result'):
                user = data['result'][0]
                
                result['data']['handle'] = user.get('handle')
                result['data']['rating'] = user.get('rating', 0)
                result['data']['max_rating'] = user.get('maxRating', 0)
                result['data']['rank'] = user.get('rank', 'unrated')
                result['data']['max_rank'] = user.get('maxRank', 'unrated')
                
                # Scoring based on rating
                rating = result['data']['rating']
                score = 40
                if rating > 1200:
                    score += min((rating - 1200) / 20, 30)
                if rating > 1600:
                    score += 15
                if rating > 2000:
                    score += 15
                result['score'] = min(score, 100)
                
                # Indicators
                if rating > 1400:
                    result['indicators'].append(f"Codeforces Rating: {rating} ({result['data']['rank']})")
                if result['data']['max_rating'] > 1600:
                    result['indicators'].append(f"Peak rating: {result['data']['max_rating']}")
    
    except Exception as e:
        result['error'] = str(e)
    
    return result


def scrape_portfolio_site(portfolio_url: str) -> Dict:
    """Scrape portfolio/personal website"""
    result = {
        'platform': 'Portfolio',
        'url': portfolio_url,
        'score': 0,
        'data': {},
        'indicators': []
    }
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(portfolio_url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title
            title = soup.find('title')
            if title:
                result['data']['title'] = title.get_text().strip()
            
            # Look for project sections
            project_keywords = ['project', 'work', 'portfolio', 'showcase']
            projects_found = 0
            for keyword in project_keywords:
                sections = soup.find_all(['section', 'div'], class_=re.compile(keyword, re.I))
                projects_found += len(sections)
            
            result['data']['project_sections'] = projects_found
            
            # Look for technology mentions
            tech_keywords = ['react', 'node', 'python', 'java', 'docker', 'aws', 'mongodb', 'sql']
            tech_found = []
            page_text = soup.get_text().lower()
            for tech in tech_keywords:
                if tech in page_text:
                    tech_found.append(tech)
            
            result['data']['technologies_mentioned'] = tech_found
            
            # Basic scoring
            score = 50  # Having a portfolio is good
            if projects_found > 0:
                score += 20
            if len(tech_found) > 3:
                score += 15
            if soup.find_all('a', href=True):  # Has links
                score += 15
            
            result['score'] = min(score, 100)
            
            # Indicators
            if result['data'].get('title'):
                result['indicators'].append(f"Personal portfolio: {result['data']['title'][:50]}")
            if projects_found > 0:
                result['indicators'].append(f"Showcases {projects_found} project section(s)")
            if len(tech_found) > 3:
                result['indicators'].append(f"Mentions technologies: {', '.join(tech_found[:5])}")
    
    except Exception as e:
        result['error'] = str(e)
    
    return result


def analyze_online_presence(parsed_profile: dict, raw_text: str = "") -> Dict:
    """Analyze candidate's online presence across all platforms"""
    result = {
        'score': 0,
        'platforms': [],
        'total_indicators': [],
        'summary': ''
    }
    
    # Extract URLs from resume
    all_text = raw_text + " "
    if parsed_profile:
        links = parsed_profile.get('links', {})
        if isinstance(links, dict):
            for key, value in links.items():
                if value:
                    # Add https:// prefix if missing
                    if value and not value.startswith('http'):
                        value = f"https://{value}"
                    all_text += f" {value} "
        
        # Also check raw_sections
        raw_sections = parsed_profile.get('raw_sections', {})
        if isinstance(raw_sections, dict):
            for value in raw_sections.values():
                if value:
                    all_text += f" {value} "
    
    urls = extract_urls_from_text(all_text)
    
    total_score = 0
    platforms_scored = 0
    
    # Scrape GitHub
    if urls['github']:
        github_data = scrape_github_profile(urls['github'])
        if github_data['score'] > 0:
            result['platforms'].append(github_data)
            total_score += github_data['score']
            platforms_scored += 1
            result['total_indicators'].extend(github_data['indicators'])
    
    # Scrape LeetCode
    if urls['leetcode']:
        leetcode_data = scrape_leetcode_profile(urls['leetcode'])
        if leetcode_data['score'] > 0:
            result['platforms'].append(leetcode_data)
            total_score += leetcode_data['score']
            platforms_scored += 1
            result['total_indicators'].extend(leetcode_data['indicators'])
    
    # Scrape Codeforces
    if urls['codeforces']:
        codeforces_data = scrape_codeforces_profile(urls['codeforces'])
        if codeforces_data['score'] > 0:
            result['platforms'].append(codeforces_data)
            total_score += codeforces_data['score']
            platforms_scored += 1
            result['total_indicators'].extend(codeforces_data['indicators'])
    
    # Scrape Portfolio
    if urls['portfolio']:
        portfolio_data = scrape_portfolio_site(urls['portfolio'])
        if portfolio_data['score'] > 0:
            result['platforms'].append(portfolio_data)
            total_score += portfolio_data['score']
            platforms_scored += 1
            result['total_indicators'].extend(portfolio_data['indicators'])
    
    # Calculate average score
    if platforms_scored > 0:
        result['score'] = round(total_score / platforms_scored, 1)
    else:
        result['score'] = 0
    
    # Generate summary
    if platforms_scored == 0:
        result['summary'] = "No online coding profiles found"
    elif result['score'] >= 80:
        result['summary'] = f"Exceptional online presence ({platforms_scored} platform(s))"
    elif result['score'] >= 60:
        result['summary'] = f"Strong online presence ({platforms_scored} platform(s))"
    elif result['score'] >= 40:
        result['summary'] = f"Good online presence ({platforms_scored} platform(s))"
    else:
        result['summary'] = f"Basic online presence ({platforms_scored} platform(s))"
    
    return result
