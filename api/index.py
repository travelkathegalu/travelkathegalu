import os
import time
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import instaloader

load_dotenv()

app = Flask(__name__)
CORS(app)

cache = {
    'data': None,
    'timestamp': 0
}
CACHE_DURATION = 3600

def fetch_instagram_stats():
    if cache['data'] and (time.time() - cache['timestamp']) < CACHE_DURATION:
        return cache['data']

    print("Fetching fresh data from Instagram...")
    L = instaloader.Instaloader()
    
    username = os.getenv('IG_USERNAME')
    password = os.getenv('IG_PASSWORD')
    
    if not username:
        return {"error": "IG_USERNAME not found in environment"}
        
    try:
        # For non-authenticated fetch, we don't always need login, 
        # but let's try if credentials exist
        if password and password != "your_password_here":
            try:
                L.login(username, password)
            except Exception as e:
                print(f"Login failed: {e}")

        # Profile fetch
        profile = instaloader.Profile.from_username(L.context, username)
        
        stats = {
            "username": profile.username,
            "followers": profile.followers,
            "following": profile.followees,
            "total_posts": profile.mediacount,
            "bio": profile.biography,
        }
        
        # Fetch up to 11 posts (This avoids triggering a secondary GraphQL query which fails without login)
        all_posts = []
        count = 0
        total_likes = 0
        total_comments = 0
        
        for post in profile.get_posts():
            if count >= 11:
                break
                
            views = post.video_view_count if post.is_video else post.likes * 2 # rough heuristic
            
            all_posts.append({
                "url": post.url,
                "likes": post.likes,
                "comments": post.comments,
                "is_video": post.is_video,
                "video_views": views,
                "caption": post.caption if post.caption else "Travel visually told.",
            })
            
            if count < 10: # ER based on recent 10
                total_likes += post.likes
                total_comments += post.comments
                
            count += 1
            
        # Sort by video_views descending
        all_posts.sort(key=lambda x: x["video_views"] or 0, reverse=True)
        
        # Take Top 7
        top_posts = all_posts[:7]
        
        final_posts = []
        for i, p in enumerate(top_posts):
            # On Vercel, we skip local downloading to avoid read-only FS errors
            # We just return the short-lived IG URL for now
            final_posts.append({
                "local_image": p["url"], 
                "likes": p["likes"],
                "comments": p["comments"],
                "is_video": p["is_video"],
                "video_views": p["video_views"],
                "caption": p["caption"],
            })

        stats['recent_posts'] = final_posts
        stats['engagement_rate'] = round(((total_likes + total_comments) / (min(count, 10) * profile.followers)) * 100, 2) if count > 0 and profile.followers > 0 else 0
        
        cache['data'] = stats
        cache['timestamp'] = time.time()
        
        return stats
        
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return {"error": str(e)}

@app.route('/api/stats', methods=['GET'])
def get_stats():
    data = fetch_instagram_stats()
    if "error" in data:
        return jsonify(data), 500
    return jsonify(data)

# handler for vercel
def handler(event, context):
    return app(event, context)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
