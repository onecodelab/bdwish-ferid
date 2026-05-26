//jshint esversion:6
import { balloons } from "balloons-js";

const button = document.querySelector(".btn"),
  darkroom = document.querySelector(".darkroom"),
  giftroom = document.querySelector(".giftroom"),
  hallway = document.querySelector(".hallway"),
  room = document.querySelector(".empty-room"),
  flash = document.querySelector(".flash");

// These are the text elements that hold messages to be displayed in the respective screes

const blackText = document.querySelectorAll(".bb-text"), // msgs in the dark room scene
  giftText = document.querySelectorAll(".gift-text"), // msgs in the gift scene
  hallText = document.querySelectorAll(".hall-text"), // msgs in the hallway scene
  roomText = document.querySelectorAll(".room-text"), // msgs in empty room scene
  CTAtext = document.querySelector(".btn-ref");

//Elements in the card page

const frames = document.querySelectorAll(".frame"),
  msgWindow = document.querySelector(".scroll"), // this one has the message frame in [0] and card fram in [1]
  msg = document.querySelector(".text"); // the Message para

// Carousel elements
const slides = document.querySelectorAll(".carousel-slide"),
      nextBtn = document.querySelector(".carousel-btn.next"),
      prevBtn = document.querySelector(".carousel-btn.prev");
let currentSlide = 0;
let slideInterval;

const adjustCarouselSize = (img) => {
  const carousel = document.querySelector(".carousel");
  if (!carousel || !img) return;

  const applySize = () => {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (naturalWidth && naturalHeight) {
      const aspectRatio = naturalWidth / naturalHeight;
      const isMobile = window.innerWidth <= 800;
      const maxWPercent = isMobile ? 0.85 : 0.7;
      const maxHPercent = isMobile ? 0.55 : 0.6;
      
      const maxWidth = window.innerWidth * maxWPercent;
      const maxHeight = window.innerHeight * maxHPercent;
      
      let targetWidth, targetHeight;
      
      if (aspectRatio > (maxWidth / maxHeight)) {
        targetWidth = maxWidth;
        targetHeight = maxWidth / aspectRatio;
      } else {
        targetWidth = maxHeight * aspectRatio;
        targetHeight = maxHeight;
      }
      
      carousel.style.width = `${targetWidth}px`;
      carousel.style.height = `${targetHeight}px`;
    }
  };

  if (img.complete) {
    applySize();
  } else {
    img.addEventListener("load", applySize);
  }
};

const showSlide = (index) => {
  if (!slides || slides.length === 0) return;
  slides[currentSlide].classList.remove("active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
  adjustCarouselSize(slides[currentSlide]);
};

const nextSlide = () => showSlide(currentSlide + 1);
const prevSlide = () => showSlide(currentSlide - 1);

if (nextBtn && prevBtn) {
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);
}

window.addEventListener("resize", () => {
  if (slides && slides.length > 0 && frames[1] && frames[1].style.display === "flex") {
    adjustCarouselSize(slides[currentSlide]);
  }
});

//Sfx files

const light = document.querySelector(".switch-aud"),
  blast = document.querySelector(".blast-aud"),
  door = document.querySelector(".door-aud"),
  haunt = document.querySelector(".haunt-aud"),
  music = document.querySelector(".hbd-aud");

//  readMsg() displays the paras in each scene successively. It takes an array of the para elements as input.

const readMsg = (text) => {
  for (let i = 0; i < text.length; i++) {
    // this loop goes through all the text msg paras
    setTimeout(() => {
      // A timeout of 5s ia applied to all text elements so that appear successively one after the other
      text[i].classList.add("read"); // this adds a fadeIn-fadeOut animation to elements
      if (i === text.length - 1) {
        // this ensures that the button appears only after the last text is displayed.
        button.style.display = "inline-block";
        CTAtext.style.display = "block";
      }
    }, 5000 * i);
  }
};

// transition() is animation for change from one scene to another. It takes the current scene div element as input.

const transition = (currentScene) => {
  currentScene.classList.add("fade-in");
  currentScene.style.opacity = "0";
  button.style.display = "none";
  CTAtext.style.display = "none";
};

//Animation Code

/*
    In the beginning, the black page appears signifying a dark room and after displaying the msg paras
    one by one, a button(bulb) appears and the user is asked to click the button to swith on the lights.
*/

export const animate = function () {
  CTAtext.innerHTML = "Click the Light Bulb.";

  // Mobile audio auto-unlock mechanism
  const audios = [light, blast, door, haunt, music];
  const unlockAudio = () => {
    audios.forEach((audio) => {
      if (audio) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch((err) => {
            console.warn("Audio unlock issue:", err);
          });
        }
      }
    });
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };
  document.addEventListener("click", unlockAudio);
  document.addEventListener("touchstart", unlockAudio);

  readMsg(blackText);

  button.addEventListener("click", function () {
    if (button.classList.contains("switch")) {
      /* 
              When the switch is pressed, the black div will wipe out and the backgroung scene with no 
              elements will appear, signifying that the lights are turned on and the room is empty. Then 
              the msg will be displayed after which, the user will be asked to move out and the button with
              door icon will appear. 
          */

      light.play();
      transition(darkroom);
      CTAtext.innerHTML = "Click the Door";
      setTimeout(function () {
        button.classList.add("door-out");
        button.classList.remove("switch");
        darkroom.style.display = "none";
        readMsg(roomText);
      }, 4000);
    } else if (button.classList.contains("door-out")) {
      /* 
              when the door is pressed, scene changes to cemetry. Again, the msg will be displayed, after 
              which, the user will be asked to come inside and the button with door will appear again.
          */

      door.play();
      transition(room);
      setTimeout(function () {
        haunt.play();
        haunt.loop = true;
        button.classList.add("door-in");
        button.classList.remove("door-out");
        room.style.display = "none";
        readMsg(hallText);
      }, 4000);
    } else if (button.classList.contains("door-in")) {
      /* 
              when the door is pressed, scene changes to the gift room. Again, the msg will be displayed, after 
              which, the user will be asked to open the gift and the button with gift will appear.
          */

      door.play();
      transition(hallway);
      CTAtext.innerHTML = "Click the Gift";
      setTimeout(function () {
        button.classList.add("gift");
        button.classList.remove("door-in");
        hallway.style.display = "none";
        readMsg(giftText);
      }, 4000);
    } else if (button.classList.contains("gift")) {
      /* 
              when the gift is pressed, the gift scene vanishes and the white div fades slowly giving a sense 
              of explosion. After that, the message frame appears and moves up until the message completes. Then,
              the message frame fades away and the card appears.
          */

      haunt.pause();
      blast.play();
      giftroom.style.display = "none";
      transition(flash);

      music.loop = true;
      music.play();

      try {
        balloons();
      } catch (err) {
        console.warn("Balloons-js failed to launch:", err);
      }

      // Calculate readTime dynamically
      let parsedTime = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--readTime"
        )
      );

      // If no valid readTime is set (e.g. SCROLL_MSG is not set on Vercel), show the carousel for 20 seconds
      let readTime = 20;
      if (!isNaN(parsedTime) && parsedTime > 0) {
        readTime = parsedTime + 5;
      }

      frames[1].style.display = "flex";

      setTimeout(() => {
        frames[1].classList.add("appear");
        frames[1].style.opacity = "1";
        msg.classList.add("move-up");
        if (slides && slides.length > 0) {
          adjustCarouselSize(slides[currentSlide]);
          slideInterval = setInterval(nextSlide, 3000);
        }
      }, 1500);

      setTimeout(() => {
        msg.style.transform = "translateY(-100%)";
        flash.style.display = "none";
      }, 5000);

      setTimeout(() => {
        msgWindow.classList.add("fade-in");
        msgWindow.style.opacity = "0";
      }, readTime * 1000);

      setTimeout(() => {
        if (slideInterval) clearInterval(slideInterval);
        frames[1].style.display = "none";
        frames[0].style.display = "flex";
        frames[0].classList.add("appear");
        frames[0].style.opacity = "1";
      }, (readTime + 3) * 1000);
    }
  });
};
