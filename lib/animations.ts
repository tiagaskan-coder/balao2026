
import gsap from 'gsap';

/**
 * Animates an item flying into the cart.
 * @param startElement The element to start the animation from (e.g., the product image or button).
 * @param imageUrl The URL of the image to fly.
 * @param targetSelector The CSS selector for the target element (default: '#cart-icon-container').
 */
export const animateAddToCart = (
  startElement: HTMLElement | null,
  imageUrl: string,
  targetSelector: string = '#cart-icon-container'
) => {
  if (!startElement) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  // Create the flying image
  const flyingImage = document.createElement('img');
  flyingImage.src = imageUrl;
  flyingImage.style.position = 'fixed';
  flyingImage.style.zIndex = '9999';
  flyingImage.style.pointerEvents = 'none';
  flyingImage.style.borderRadius = '50%';
  flyingImage.style.objectFit = 'cover';
  
  // Get initial position
  const startRect = startElement.getBoundingClientRect();
  flyingImage.style.width = `${Math.min(startRect.width, 100)}px`;
  flyingImage.style.height = `${Math.min(startRect.height, 100)}px`;
  flyingImage.style.left = `${startRect.left + (startRect.width / 2) - 50}px`; // Center horizontally
  flyingImage.style.top = `${startRect.top + (startRect.height / 2) - 50}px`;   // Center vertically

  document.body.appendChild(flyingImage);

  // Get target position
  const targetRect = target.getBoundingClientRect();
  const targetX = targetRect.left + (targetRect.width / 2) - (parseFloat(flyingImage.style.width) / 2);
  const targetY = targetRect.top + (targetRect.height / 2) - (parseFloat(flyingImage.style.height) / 2);

  // Animate using GSAP
  const timeline = gsap.timeline({
    onComplete: () => {
      if (flyingImage.parentNode) {
        flyingImage.parentNode.removeChild(flyingImage);
      }
      
      // Optional: Shake the cart icon
      gsap.fromTo(target, 
        { rotation: -10, scale: 1.2 }, 
        { rotation: 0, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    }
  });

  // "Genie" effect: Move to target, scale down, and fade slightly
  timeline.to(flyingImage, {
    duration: 0.8,
    x: targetX - parseFloat(flyingImage.style.left),
    y: targetY - parseFloat(flyingImage.style.top),
    width: 20,
    height: 20,
    opacity: 0.5,
    borderRadius: '50%',
    ease: "power3.inOut" // Starts slow, speeds up, slows down at end
  });
};
