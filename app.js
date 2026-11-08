// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmTTmT5LYU9WSx756P-Oqhrx157257_4o",
  authDomain: "swanandi-29e03.firebaseapp.com",
  projectId: "swanandi-29e03",
  storageBucket: "swanandi-29e03.firebasestorage.app",
  messagingSenderId: "610889352838",
  appId: "1:610889352838:web:a24ed4b833cd0fb18eb307"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let eventsList = [];
let categoriesList = [];
let currentTab = 'upcoming';

async function initApp() {
    await fetchCategories();
    await fetchEventsFromFirestore(); // <-- This requires the function below to exist
}

// 1. Fetch Categories for Registration Dropdown
// Fetch Category Master from Firestore and populate dropdown
async function fetchCategories() {
    const selectDropdown = document.getElementById('danceStyle');
    if (!selectDropdown) return;

    // Show loading indicator in dropdown
    selectDropdown.innerHTML = `<option value="" disabled selected>Loading dance styles from cloud...</option>`;

    try {
        const querySnapshot = await getDocs(collection(db, "dance_categories"));
        categoriesList = [];
        querySnapshot.forEach((doc) => {
            categoriesList.push({ id: doc.id, ...doc.data() });
        });

        selectDropdown.innerHTML = '';

        if (categoriesList.length === 0) {
            selectDropdown.innerHTML = `<option value="General">General / Bollywood</option>`;
            return;
        }

        // Add a default placeholder prompt
        selectDropdown.innerHTML = `<option value="" disabled selected>Select your preferred style</option>`;

        // Dynamically populate options from your Firestore Category Master
        categoriesList.forEach(cat => {
            selectDropdown.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
    } catch (error) {
        console.error("Error fetching categories from Firestore:", error);
        selectDropdown.innerHTML = `<option value="Bollywood">Bollywood</option><option value="Freestyle">Freestyle</option>`;
    }
}

// 2. Fetch Events for Home Page Grid
async function fetchEventsFromFirestore() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    
    grid.innerHTML = `<div class="col-span-2 bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400"><p class="text-xs">Loading events...</p></div>`;

    try {
        const querySnapshot = await getDocs(collection(db, "dance_events"));
        eventsList = [];
        querySnapshot.forEach((doc) => {
            eventsList.push({ id: doc.id, ...doc.data() });
        });

        renderEvents();
    } catch (error) {
        console.error("Error fetching events:", error);
        grid.innerHTML = `<div class="col-span-2 bg-white p-8 rounded-3xl border border-slate-100 text-center text-red-400"><p class="text-xs">Error loading events.</p></div>`;
    }
}

function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = eventsList.filter(e => (e.status || 'upcoming') === currentTab);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400"><p class="text-xs">No ${currentTab} events found.</p></div>`;
        return;
    }

    filtered.forEach(ev => {
        const isUpcoming = (ev.status || 'upcoming') === 'upcoming';
        const itemImg = ev.img || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60';
        
        grid.innerHTML += `
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                <div class="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img src="${itemImg}" alt="${ev.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    <span class="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1 rounded-2xl shadow-sm">${ev.category || 'General'}</span>
                    <span class="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-xl"><i class="fa-regular fa-calendar mr-1"></i> ${ev.date || 'TBA'}</span>
                </div>
                <div class="p-6 flex flex-col justify-between flex-grow space-y-4">
                    <div class="space-y-1">
                        <h4 class="font-extrabold text-slate-900 text-base">${ev.title}</h4>
                        <p class="text-xs text-slate-500 leading-relaxed">${ev.desc || ''}</p>
                    </div>
                    <div class="flex gap-2">
                        ${isUpcoming ? 
                            `<button onclick="window.selectEventForRegistration('${ev.title.replace(/'/g, "\\'")}')" class="flex-1 bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-700 border border-pink-100 text-xs font-extrabold py-3 rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-user-plus text-[10px]"></i> Register
                            </button>` : 
                            `<span class="flex-1 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-default">
                                <i class="fa-solid fa-check text-[10px]"></i> Completed
                            </span>`
                        }
                        <button onclick="window.viewParticipants('${ev.title.replace(/'/g, "\\'")}')" class="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-2xl transition flex items-center justify-center" title="View Participants">
                            <i class="fa-solid fa-users"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}


// Expose functions globally for HTML onclick attributes
window.switchEventTab = function(tab) {
    currentTab = tab;
    const btnUpcoming = document.getElementById('tab-upcoming');
    const btnPassed = document.getElementById('tab-passed');

    if (tab === 'upcoming') {
        btnUpcoming.className = "px-4 py-2 text-xs font-extrabold rounded-xl bg-white text-slate-900 shadow-sm transition";
        btnPassed.className = "px-4 py-2 text-xs font-extrabold rounded-xl text-slate-500 hover:text-slate-900 transition";
    } else {
        btnPassed.className = "px-4 py-2 text-xs font-extrabold rounded-xl bg-white text-slate-900 shadow-sm transition";
        btnUpcoming.className = "px-4 py-2 text-xs font-extrabold rounded-xl text-slate-500 hover:text-slate-900 transition";
    }
    renderEvents();
}

window.selectEventForRegistration = function(eventTitle) {
    const banner = document.getElementById('selectedEventBanner');
    const targetSpan = document.getElementById('targetEventName');
    const hiddenInput = document.getElementById('selectedEventTitle');

    targetSpan.textContent = eventTitle;
    hiddenInput.value = eventTitle;
    banner.classList.remove('hidden');

    document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
}

window.clearTargetEvent = function() {
    const banner = document.getElementById('selectedEventBanner');
    const hiddenInput = document.getElementById('selectedEventTitle');

    hiddenInput.value = "General Inquiry / Regular Batch";
    banner.classList.add('hidden');
}

window.viewParticipants = async function(eventTitle) {
    // ... participant modal logic ...
}

// Expose submitInterest globally so the HTML form can call it
window.submitInterest = async function(e) {
    e.preventDefault();

    const name = document.getElementById('userName').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const style = document.getElementById('danceStyle').value;
    const mode = document.getElementById('classMode').value;
    const notes = document.getElementById('userNotes').value.trim();
    const targetEvent = document.getElementById('selectedEventTitle').value;

    if (!name || !phone) {
        alert("Please fill in your name and WhatsApp number.");
        return;
    }

    const inquiryRecord = {
        name: name,
        phone: phone,
        danceStyle: style,
        classMode: mode,
        notes: notes,
        targetEvent: targetEvent,
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "dance_inquiries"), inquiryRecord);
        alert(`Thank you, ${name}! Your registration for "${targetEvent}" at Swanandi Kala Manch has been submitted successfully.`);
        
        document.getElementById('interestForm').reset();
        window.clearTargetEvent();
    } catch (error) {
        console.error("Error saving inquiry:", error);
        alert("There was an error submitting your details. Please try again.");
    }
}

// Initialize on Load
initApp();