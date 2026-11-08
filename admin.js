// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let passedEvents = [];

// 1. Create Category Master
window.createCategory = async function(e) {
    e.preventDefault();
    const name = document.getElementById('catName').value.trim();
    try {
        await addDoc(collection(db, "dance_categories"), { name: name });
        alert(`Category "${name}" created successfully!`);
        document.getElementById('catName').value = '';
        loadCategoriesDropdown();
    } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category.");
    }
}

async function loadCategoriesDropdown() {
    const select = document.getElementById('evCategory');
    if (!select) return;
    try {
        const querySnapshot = await getDocs(collection(db, "dance_categories"));
        select.innerHTML = '<option value="">Select Category...</option>';
        querySnapshot.forEach((docSnap) => {
            const cat = docSnap.data();
            select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// 2. Create Event Mapped to Category
window.createEvent = async function(e) {
    e.preventDefault();
    const title = document.getElementById('evTitle').value.trim();
    const category = document.getElementById('evCategory').value;
    const date = document.getElementById('evDate').value.trim();
    const status = document.getElementById('evStatus').value;
    const img = document.getElementById('evImg').value.trim() || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60";
    const desc = document.getElementById('evDesc').value.trim();

    try {
        await addDoc(collection(db, "dance_events"), {
            title, category, date, status, img, desc
        });
        alert(`Event "${title}" published successfully!`);
        document.querySelector('form').reset();
        loadPassedEvents();
    } catch (error) {
        console.error("Error creating event:", error);
        alert("Failed to publish event.");
    }
}

// 3. Load Passed Events for Participant Management
async function loadPassedEvents() {
    const container = document.getElementById('passedEventsList');
    try {
        const querySnapshot = await getDocs(collection(db, "dance_events"));
        passedEvents = [];
        container.innerHTML = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status === 'passed') {
                passedEvents.push({ id: docSnap.id, ...data });
            }
        });

        if (passedEvents.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400">No passed events found.</p>`;
            return;
        }

        passedEvents.forEach(ev => {
            container.innerHTML += `
                <button onclick="window.selectPassedEvent('${ev.title.replace(/'/g, "\\'")}')" class="w-full text-left p-3 bg-slate-50 hover:bg-pink-50 hover:border-pink-200 border border-slate-100 rounded-xl transition text-xs font-bold text-slate-700">
                    ${ev.title} <span class="block text-[10px] text-slate-400 font-normal">${ev.date}</span>
                </button>
            `;
        });
    } catch (error) {
        console.error("Error loading passed events:", error);
    }
}

// Select a passed event to view and manage participants
window.selectPassedEvent = async function(eventTitle) {
    document.getElementById('selectedEventHeading').textContent = `Participants for: ${eventTitle}`;
    const container = document.getElementById('eventParticipantsContainer');
    container.innerHTML = `<p class="text-xs text-slate-400">Loading participants...</p>`;

    try {
        const q = query(collection(db, "dance_inquiries"), where("targetEvent", "==", eventTitle));
        const querySnapshot = await getDocs(q);

        container.innerHTML = '';
        if (querySnapshot.empty) {
            container.innerHTML = `
                <p class="text-xs text-slate-500 mb-3">No registrations found for this event yet. You can add a participant manually below:</p>
                <div class="flex gap-2">
                    <input type="text" id="manualName" placeholder="Participant Name" class="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 flex-grow">
                    <input type="text" id="manualPhoto" placeholder="ImgBB Photo URL" class="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 flex-grow">
                    <button onclick="window.addManualParticipant('${eventTitle.replace(/'/g, "\\'")}')" class="bg-pink-600 text-white text-xs font-bold px-3 py-2 rounded-xl">Add</button>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const docId = docSnap.id;
            const photo = p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60';

            container.innerHTML += `
                <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 gap-3">
                    <div class="flex items-center gap-3">
                        <img src="${photo}" class="w-9 h-9 rounded-full object-cover border border-pink-200">
                        <div>
                            <h5 class="font-extrabold text-slate-900 text-xs">${p.name}</h5>
                            <p class="text-[10px] text-slate-400">Phone: ${p.phone}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="text" id="pPhoto-${docId}" value="${p.photoUrl || ''}" placeholder="ImgBB URL..." class="text-[11px] rounded-lg border border-slate-200 px-2 py-1.5 w-36">
                        <button onclick="window.updateParticipantPhoto('${docId}', '${eventTitle.replace(/'/g, "\\'")}')" class="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Save</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading participants:", error);
    }
}

// Update photo for existing participant
window.updateParticipantPhoto = async function(docId, eventTitle) {
    const photoUrl = document.getElementById(`pPhoto-${docId}`).value.trim();
    try {
        await updateDoc(doc(db, "dance_inquiries", docId), { photoUrl });
        alert("Participant photo updated successfully!");
        window.selectPassedEvent(eventTitle);
    } catch (error) {
        console.error("Error updating photo:", error);
        alert("Failed to update photo.");
    }
}

// 4. Load Student Registrations into Admin Table
async function loadRegistrations() {
    const tableBody = document.getElementById('registrationsTableBody');
    if (!tableBody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "dance_inquiries"));
        tableBody.innerHTML = '';

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">No student registrations found yet.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const reg = docSnap.data();
            tableBody.innerHTML += `
                <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4 font-extrabold text-slate-900">${reg.name}</td>
                    <td class="py-3.5 px-4 font-medium text-slate-600">${reg.phone}</td>
                    <td class="py-3.5 px-4">
                        <span class="bg-pink-50 text-pink-700 font-bold px-2.5 py-1 rounded-full text-[10px]">${reg.danceStyle || 'General'}</span>
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-600">${reg.classMode || 'N/A'}</td>
                    <td class="py-3.5 px-4 font-semibold text-slate-800">${reg.targetEvent || 'General Batch'}</td>
                    <td class="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">${reg.notes || '-'}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading registrations:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-red-400">Error loading registration records.</td></tr>`;
    }
}

// Update your initAdmin function to include loadRegistrations()
async function initAdmin() {
    await loadCategoriesDropdown();
    await loadPassedEvents();
    await loadRegistrations(); // <-- Added here
}

initAdmin();