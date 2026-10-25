/* ==========================================================================
   AGATE ESPORTS SLIDE PRESENTATION INTERACTION CONTROLLER (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT ELEMENTS
    const slides = document.querySelectorAll('.slide');
    const currentSlideNumEl = document.getElementById('current-slide-num');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    
    const totalSlides = slides.length;
    let currentIdx = 0; // 0-indexed representation of slides (0 to 9)

    // 2. MAIN STATE UPDATE ROUTINE
    function updatePresentationState() {
        // Remove 'active' class from all slides
        slides.forEach((slide, idx) => {
            if (idx === currentIdx) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update top-right header numeric tracker (1-indexed display)
        const currentDisplayNum = currentIdx + 1;
        currentSlideNumEl.textContent = currentDisplayNum.toString().padStart(2, '0');

        // Update progress bar percentage width
        const progressPercentage = (currentDisplayNum / totalSlides) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Manage footer button visibilities or labels
        if (currentIdx === 0) {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }

        if (currentIdx === totalSlides - 1) {
            nextBtn.innerHTML = 'FINISH <i class="fa-solid fa-flag-checkered"></i>';
        } else {
            nextBtn.innerHTML = 'NEXT <i class="fa-solid fa-chevron-right"></i>';
        }
    }

    // 3. NAVIGATION TRIGGERS
    function navigateNext() {
        if (currentIdx < totalSlides - 1) {
            currentIdx++;
            updatePresentationState();
        } else {
            // End of deck animation feedback
            nextBtn.classList.add('pulse-finish');
            setTimeout(() => {
                nextBtn.classList.remove('pulse-finish');
            }, 1000);
        }
    }

    function navigatePrev() {
        if (currentIdx > 0) {
            currentIdx--;
            updatePresentationState();
        }
    }

    // 4. EVENT LISTENERS
    nextBtn.addEventListener('click', navigateNext);
    prevBtn.addEventListener('click', navigatePrev);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ': // Space bar
                e.preventDefault();
                navigateNext();
                break;
            case 'ArrowLeft':
            case 'Backspace':
                e.preventDefault();
                navigatePrev();
                break;
            default:
                break;
        }
    });

    // Touch Swipe Support for Tablets/Mobiles
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, false);

    function handleSwipeGesture() {
        const threshold = 50; // swipe length threshold in px
        if (touchStartX - touchEndX > threshold) {
            // Swiped left -> Next slide
            navigateNext();
        } else if (touchEndX - touchStartX > threshold) {
            // Swiped right -> Prev slide
            navigatePrev();
        }
    }

    // 5. INITIALIZE DECK
    updatePresentationState();
});
