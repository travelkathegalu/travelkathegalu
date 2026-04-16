document.addEventListener('DOMContentLoaded', () => {
    // --- Fetch Live Instagram Stats ---
    async function fetchLiveContent() {
        try {
            const followerEl = document.getElementById('live-followers');
            const erEl = document.getElementById('live-er');
            
            const response = await fetch('http://127.0.0.1:5000/api/stats');
            const data = await response.json();
            
            if (data.followers !== undefined) {
                // Update Followers
                let formattedFollowers = data.followers >= 1000 ? (data.followers / 1000).toFixed(1) + 'K+' : data.followers;
                if (followerEl) followerEl.textContent = formattedFollowers;
                
                // Update ER
                if (erEl && data.engagement_rate) erEl.textContent = data.engagement_rate + '%';
                
                // NOTE: Content grid is hardcoded with 4 specific reels - no auto-overwrite
                
                // Update Case Study images & captions from top posts if available
                if (data.recent_posts && data.recent_posts.length >= 7) {
                    const c1 = document.getElementById('case-image-1');
                    const c2 = document.getElementById('case-image-2');
                    if (c1) c1.src = data.recent_posts[5].local_image;
                    if (c2) c2.src = data.recent_posts[6].local_image;
                    
                    // Parse caption into title + description
                    function cleanCaption(text) {
                        if (!text) return ["Travel Destination", "Exploring the world locally."];
                        const cleanText = text.replace(/#\S+/g, '').replace(/@\S+/g, '').trim();
                        const splitIndex = cleanText.indexOf('\n') > 0 ? cleanText.indexOf('\n') : (cleanText.indexOf('.') > 0 ? cleanText.indexOf('.') + 1 : 40);
                        const t = cleanText.substring(0, splitIndex).trim().substring(0, 50);
                        const d = cleanText.substring(splitIndex).trim().substring(0, 160) + '...';
                        return [t || "Featured Reel", d];
                    }
                    
                    const title1 = document.getElementById('case-title-1');
                    const desc1 = document.getElementById('case-desc-1');
                    const title2 = document.getElementById('case-title-2');
                    const desc2 = document.getElementById('case-desc-2');
                    
                    if (title1 && data.recent_posts[5].caption) {
                        const [t1, d1] = cleanCaption(data.recent_posts[5].caption);
                        title1.textContent = t1;
                        if (desc1) desc1.textContent = d1;
                    }
                    if (title2 && data.recent_posts[6].caption) {
                        const [t2, d2] = cleanCaption(data.recent_posts[6].caption);
                        title2.textContent = t2;
                        if (desc2) desc2.textContent = d2;
                    }
                }
            } else if (data.error) {
                console.error("IG fetch error:", data.error);
            }
        } catch (error) {
            console.error("Failed to fetch live stats. Backend might be down.", error);
        }
    }
    fetchLiveContent();

    function formatShort(num) {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // --- Smooth Scrolling for Navbar Links ---
    const navLinks = document.querySelectorAll('.nav-links a, .hero-ctas a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- Intersection Observer for Fade-In Animations ---
    const animatedElements = document.querySelectorAll('.fade-in-up');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    // --- Form Handling (Mailto Fallback) ---
    const contactForm = document.getElementById('collab-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const name = document.getElementById('name').value;
            const brand = document.getElementById('brand').value;
            const location = document.getElementById('location').value;
            const type = document.getElementById('type').value;
            const budget = document.getElementById('budget').value || 'Unspecified';
            
            const subject = encodeURIComponent(`Collaboration Inquiry: ${brand} x Travel Kathegalu`);
            const body = encodeURIComponent(`Hello Devika,\n\nI am reaching out from ${brand} (${location}) regarding a potential collaboration.\n\nDetails:\nName: ${name}\nCollaboration Type: ${type}\nApprox Budget: ${budget}\n\nLooking forward to discussing further!\n\nThanks,\n${name}`);
            
            window.location.href = `mailto:hello@travelkathegalu.com?subject=${subject}&body=${body}`;
        });
    }
});
