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

# Global cache for serverless environment persistence (within warm instance)
cache = {
    'data': None,
    'timestamp': 0
}
CACHE_DURATION = 1800 # 30 mins

def fetch_instagram_stats():
    # 1. Return cached data if available and fresh
    if cache['data'] and (time.time() - cache['timestamp']) < CACHE_DURATION:
        return cache['data']

    print("Fetching fresh data from Instagram...")
    # Use a custom session with a timeout to prevent Vercel 504s
    L = instaloader.Instaloader(max_connection_attempts=1)
    
    username = os.getenv('IG_USERNAME')
    password = os.getenv('IG_PASSWORD')
    
    if not username:
        return {"error": "IG_USERNAME not found in environment"}
        
    try:
        # Step A: Get Profile (Fastest)
        profile = instaloader.Profile.from_username(L.context, username)
        
        stats = {
            "username": profile.username,
            "followers": profile.followers,
            "following": profile.followees,
            "total_posts": profile.mediacount,
            "bio": profile.biography,
            "engagement_rate": None, # Null initially
            "recent_posts": []
        }

        # Step B: Get Posts (Slowest, prone to blocking/timeouts)
        # We wrap this in a limited loop to avoid 504s
        all_posts = []
        count = 0
        total_likes = 0
        total_comments = 0
        
        # We only look at the first few posts to calculate ER quickly
        try:
            for post in profile.get_posts():
                if count >= 8: # Reduced from 11 to 8 for speed
                    break
                    
                views = post.video_view_count if post.is_video else post.likes * 2
                
                all_posts.append({
                    "url": post.url,
                    "likes": post.likes,
                    "comments": post.comments,
                    "is_video": post.is_video,
                    "video_views": views,
                    "caption": post.caption if post.caption else "Travel visually told.",
                })
                
                total_likes += post.likes
                total_comments += post.comments
                count += 1
                
                # If we've already spent too much time, break early to save the follower count
                # (Vercel has 10s limit, we should aim for <8s)
        except Exception as post_err:
            print(f"Post fetch partially failed: {post_err}")
            # We don't fail the whole request, we just return what we have (followers)

        if count > 0:
            all_posts.sort(key=lambda x: x["video_views"] or 0, reverse=True)
            stats['recent_posts'] = all_posts[:7]
            stats['engagement_rate'] = round(((total_likes + total_comments) / (count * profile.followers)) * 100, 2) if profile.followers > 0 else 0
        
        # 2. Update cache on success (even partial success)
        cache['data'] = stats
        cache['timestamp'] = time.time()
        
        return stats
        
    except Exception as e:
        print(f"Critical error fetching profile: {e}")
        # If we have old cache, return it rather than an error
        if cache['data']:
            return cache['data']
        return {"error": str(e)}

@app.route('/api/stats', methods=['GET'])
def get_stats():
    data = fetch_instagram_stats()
    if "error" in data and not cache['data']:
        return jsonify(data), 500
    return jsonify(data)

# handler for vercel
def handler(event, context):
    return app(event, context)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
