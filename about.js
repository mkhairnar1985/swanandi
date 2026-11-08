// about.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function fetchAwardsFromFirestore() {
    const grid = document.getElementById('awardsGrid');
    try {
        const querySnapshot = await getDocs(collection(db, "dance_awards"));
        let awardsList = [];
        querySnapshot.forEach((doc) => {
            awardsList.push({ id: doc.id, ...doc.data() });
        });

        if (awardsList.length === 0) {
            awardsList = [
                {
                    id: "aw-1",
                    title: "Best Choreography Icon",
                    category: "Excellence Award",
                    desc: "Awarded for outstanding stage productions and freestyle mentoring through Swanandi Kala Manch.",
                    icon: "trophy"
                }
            ];
        }

        grid.innerHTML = '';
        awardsList.forEach(aw => {
            const iconName = aw.icon || 'trophy';
            grid.innerHTML += `
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition space-y-4">
                    <div class="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                        <i class="fa-solid fa-${iconName}"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wide">${aw.category}</span>
                        <h4 class="font-extrabold text-slate-900 text-base mt-2">${aw.title}</h4>
                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">${aw.desc}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching awards:", error);
        grid.innerHTML = `<div class="col-span-3 bg-white p-8 rounded-3xl border border-slate-100 text-center text-red-400"><p class="text-xs">Error loading awards from database.</p></div>`;
    }
}

// Toggle mobile navigation menu
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

fetchAwardsFromFirestore();