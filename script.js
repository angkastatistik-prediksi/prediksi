/* ===========================================
   ANGKA STATISTIK
   script.js
=========================================== */

document.addEventListener("DOMContentLoaded",()=>{

const openMenu=document.getElementById("openMenu");
const closeMenu=document.getElementById("closeMenu");
const sideMenu=document.getElementById("sideMenu");
const overlay=document.getElementById("menuOverlay");
const backTop=document.getElementById("backTop");

/* ================= MENU ================= */

function bukaMenu(){

sideMenu.classList.add("active");
overlay.classList.add("active");

}

function tutupMenu(){

sideMenu.classList.remove("active");
overlay.classList.remove("active");

}

if(openMenu){

openMenu.addEventListener("click",bukaMenu);

}

if(closeMenu){

closeMenu.addEventListener("click",tutupMenu);

}

if(overlay){

overlay.addEventListener("click",tutupMenu);

}

/* ================= ESC ================= */

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

tutupMenu();

}

});

/* ================= BACK TOP ================= */

window.addEventListener("scroll",()=>{

if(window.scrollY>300){

backTop.style.display="flex";

}else{

backTop.style.display="none";

}

});

if(backTop){

backTop.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

}

/* ================= MENU ACTIVE ================= */

document.querySelectorAll(".menu-card").forEach(card=>{

card.addEventListener("click",()=>{

document.querySelectorAll(".menu-card").forEach(c=>{

c.classList.remove("active-card");

});

card.classList.add("active-card");

});

});

/* ================= LINK ACTIVE ================= */

const current=location.pathname;

document.querySelectorAll(".side-menu a").forEach(link=>{

if(link.getAttribute("href")==current){

link.style.color="#38bdf8";

link.style.fontWeight="bold";

}

});

/* ================= TOUCH EFFECT ================= */

document.querySelectorAll(".menu-card").forEach(card=>{

card.addEventListener("touchstart",()=>{

card.style.transform="scale(.98)";

});

card.addEventListener("touchend",()=>{

card.style.transform="";

});

});

/* ================= HEADER SCROLL ================= */

const hero=document.querySelector(".hero");

window.addEventListener("scroll",()=>{

if(window.scrollY>50){

hero.style.transition=".25s";

hero.style.filter="brightness(.95)";

}else{

hero.style.filter="brightness(1)";

}

});

});
