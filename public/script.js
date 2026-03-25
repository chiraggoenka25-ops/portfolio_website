document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'dark';

    if (currentTheme === 'light') {
        root.setAttribute('data-theme', 'light');
        if(themeToggle) themeToggle.innerHTML = '🌙';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) {
                root.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '☀️';
            } else {
                root.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '🌙';
            }
        });
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Reveal Animations & Skill Bars using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                
                // If it's the skills section, animate the bars
                if (entry.target.id === 'skills') {
                    const skillBars = entry.target.querySelectorAll('.skill-progress');
                    skillBars.forEach(bar => {
                        bar.style.width = bar.getAttribute('data-width');
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Scroll to Top Logic
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    
    if (scrollToTopBtn) {
        window.addEventListener("scroll", () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        });

        scrollToTopBtn.addEventListener("click", () => {
            // HUD Target Spawning
            const hud = document.createElement('div');
            hud.classList.add('hud-target');
            document.body.appendChild(hud);
            
            // Motion Blur for Combat Mode Warp (Avoid body filter to preserve viewport fixed pos)
            const effectElements = document.querySelectorAll('canvas, nav, .section, footer');
            effectElements.forEach(el => {
                el.style.transition = "filter 0.4s ease";
                el.style.filter = "contrast(1.3) brightness(1.2) hue-rotate(-5deg)";
            });

            // Wait 600ms for Lock-on crosshair recoil, then Rip Scroll
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }, 600);

            // Clear effects
            setTimeout(() => {
                effectElements.forEach(el => el.style.filter = "");
            }, 1200);

            // Cleanup DOM
            setTimeout(() => {
                hud.remove();
            }, 1000);
        });
    }

    // Form submission
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Setup loading state
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;
            formMessage.className = 'form-message';
            formMessage.innerText = '';

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showToast('Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    showToast(errorData.error || 'Failed to send message.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Network error. Please try again.', 'error');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Typing Animation
    const typedTextSpan = document.querySelector(".typed-text");
    const cursorSpan = document.querySelector(".cursor");
    
    if(typedTextSpan && cursorSpan) {
        const textArray = ["Web Applications", "Backend Servers", "Interactive UI", "Digital Experiences"];
        const typingDelay = 100;
        const erasingDelay = 50;
        const newTextDelay = 2000;
        let textArrayIndex = 0;
        let charIndex = 0;
        
        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                if(!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, typingDelay);
            } 
            else {
                cursorSpan.classList.remove("typing");
                setTimeout(erase, newTextDelay);
            }
        }
        
        function erase() {
            if (charIndex > 0) {
                if(!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
                typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex-1);
                charIndex--;
                setTimeout(erase, erasingDelay);
            } 
            else {
                cursorSpan.classList.remove("typing");
                textArrayIndex++;
                if(textArrayIndex >= textArray.length) textArrayIndex = 0;
                setTimeout(type, typingDelay + 1100);
            }
        }
        
        setTimeout(type, newTextDelay + 250);
    }

    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
        
        document.querySelectorAll('a, button, input, textarea, .skill-box, .card, .profile-img').forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
        });
    }

    // Particle Background
    const canvas = document.getElementById("particles-canvas");
    if(canvas && window.matchMedia("(pointer: fine)").matches) {
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let particlesArray;
        
        let mouse = {
            x: null,
            y: null,
            radius: 150,
            isClicking: false
        }
        
        window.addEventListener('mousemove', function(event) {
            mouse.x = event.x;
            mouse.y = event.y;
        });
        
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });
        
        window.addEventListener('mouseout', function() {
            mouse.x = undefined;
            mouse.y = undefined;
            mouse.isClicking = false;
        });
        
        // IRON SPIDER PHYSICS: Hold to pull webs, release to fire Arc Reactor blast
        window.addEventListener('mousedown', function() {
            mouse.isClicking = true;
        });

        window.addEventListener('mouseup', function() {
            mouse.isClicking = false;
            if(mouse.x && mouse.y) {
                // Arc Reactor Blast Wave Outward (Balanced)
                for (let i = 0; i < particlesArray.length; i++) {
                    let dx = particlesArray[i].x - mouse.x;
                    let dy = particlesArray[i].y - mouse.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    if(distance < 500) {
                        let force = (500 - distance) / 12;
                        particlesArray[i].vx += (dx/distance) * force * 4; 
                        particlesArray[i].vy += (dy/distance) * force * 4;
                    }
                }
            }
        });

        // Theme: Iron Spider (Spidey Web Red, Jarvis Cyan, Stark Gold)
        const themeColors = ['#e62429', '#00f3ff', '#f9d71c'];
        
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                
                // Burst physics state
                this.vx = directionX;
                this.vy = directionY;
                
                // Pulsing size state
                this.pulseAngle = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.05 + 0.02;
            }
            draw() {
                this.pulseAngle += this.pulseSpeed;
                // Balanced Pulsating Effect
                let currentSize = this.size + Math.sin(this.pulseAngle) * 1.8;
                if (currentSize < 0.1) currentSize = 0.1;

                ctx.shadowBlur = 0; 
                
                // Balanced Visibility Glow
                ctx.globalAlpha = 0.3; 
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentSize * 3.5, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                
                ctx.globalAlpha = 1.0;
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2, false);
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0 ) {
                    this.directionX = -this.directionX;
                    this.vx *= -1;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                    this.vy *= -1;
                }
                
                // Ease back to normal floating speed over time after a burst
                this.vx += (this.directionX - this.vx) * 0.05;
                this.vy += (this.directionY - this.vy) * 0.05;

                // Mouse interaction physics
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                
                if (mouse.isClicking && distance < 600) {
                    // Spider-Web Magnetic Snare (Drags particles towards Stark Core)
                    let force = (600 - distance) / 600;
                    this.vx += (dx/distance) * force * 2.5; /* Powerful Attraction */
                    this.vy += (dy/distance) * force * 2.5;
                } else if (!mouse.isClicking && distance < mouse.radius + this.size){
                    // Stark Shield Forcefield (Deflects away normally)
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 2; }
                    if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 2; }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 2; }
                    if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 2; }
                }

                this.x += this.vx;
                this.y += this.vy;
                this.draw();
            }
        }
        
        function init() {
            particlesArray = [];
            // Balanced Density
            let numberOfParticles = (canvas.height * canvas.width) / 15000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2.5) + 0.5;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 1) - 0.5;
                let directionY = (Math.random() * 1) - 0.5;
                let color = themeColors[Math.floor(Math.random() * themeColors.length)];
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }
        
        function connect() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a + 1; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = (dx*dx) + (dy*dy);
                    
                    // Spider-Web Silks (Balanced)
                    if (distance < 18000) {
                        let opacityValue = 1 - (distance/18000);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.3})`; 
                        ctx.lineWidth = mouse.isClicking ? 1.5 : 0.8; 
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
                
                // Arc Reactor Repulsor Beams (Balanced Intensity)
                if(mouse.x && mouse.y) {
                    let dxMouse = particlesArray[a].x - mouse.x;
                    let dyMouse = particlesArray[a].y - mouse.y;
                    let distanceMouse = (dxMouse*dxMouse) + (dyMouse*dyMouse);
                    
                    let beamDistance = mouse.isClicking ? 70000 : 35000;
                    if(distanceMouse < beamDistance) {
                        let mouseOpacity = 1 - (distanceMouse/beamDistance);
                        ctx.strokeStyle = `rgba(0, 243, 255, ${mouseOpacity * 0.85})`; 
                        ctx.lineWidth = mouse.isClicking ? 3.5 : 1.5; 
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0,0,innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }
        
        init();
        animate();
    }
});
