// قائمة السيارات الأولية
let initialCars = [
    { id: 1, model: "تويوتا كامري 2024", price: 250, available: true, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80", specs: { transmission: "أوتوماتيك", fuel: "بنزين", seats: 5 } },
    { id: 2, model: "هيونداي إلنترا 2023", price: 180, available: false, image: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=800&q=80", specs: { transmission: "أوتوماتيك", fuel: "بنزين", seats: 5 } },
    { id: 3, model: "مرسيدس E-Class 2024", price: 650, available: true, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80", specs: { transmission: "أوتوماتيك", fuel: "بنزين", seats: 5 } },
    { id: 4, model: "نيسان باترول 2024", price: 450, available: true, image: "https://images.unsplash.com/photo-1624365287611-39655c65778b?auto=format&fit=crop&w=800&q=80", specs: { transmission: "أوتوماتيك", fuel: "ديزل", seats: 7 } }
];

let cars = JSON.parse(localStorage.getItem('rim_cars')) || initialCars;
let currentUser = JSON.parse(localStorage.getItem('rim_user')) || null;
let userBookings = JSON.parse(localStorage.getItem('rim_bookings')) || [];
let showOnlyAvailable = false;
let selectedCarId = null;

// نظام التنقل
function navigateTo(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => { 
        p.classList.remove('active'); 
        p.style.display = 'none'; 
    });
    
    const target = document.getElementById(`page-${pageId}`);
    if(target) { 
        target.classList.add('active'); 
        target.style.display = (pageId === 'auth') ? 'flex' : 'block'; 
    }
    
    document.querySelectorAll('.nav-btn').forEach(b => { 
        b.classList.remove('text-amber-500'); 
        b.classList.add('text-slate-500'); 
    });
    
    if(btn) { 
        btn.classList.remove('text-slate-500'); 
        btn.classList.add('text-amber-500'); 
    }

    if(pageId === 'profile') updateProfilePage();
    if(pageId === 'cars') updateBookingsPage();
    if(pageId === 'admin') updateAdminPage();
    if(pageId === 'home') renderCars();
}

// تسجيل الدخول
function handleLogin() {
    const phone = document.getElementById('user-phone').value;
    const phoneRegex = /^[79]\d{7}$/;
    if(!phoneRegex.test(phone)) return alert("عذراً، يجب أن يتكون رقم الجوال من 8 أرقام ويبدأ بـ 7 أو 9");
    currentUser = { phone: phone };
    localStorage.setItem('rim_user', JSON.stringify(currentUser));
    navigateTo('home', document.querySelector('.nav-btn'));
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rim_user');
    navigateTo('home', document.querySelector('.nav-btn'));
}

// لوحة الإدارة
function checkAdminPass() {
    if(document.getElementById('admin-pass').value === "1234") {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-content').classList.remove('hidden');
        updateAdminPage();
    } else alert("كلمة المرور خاطئة");
}

function showAddCarForm() {
    document.getElementById('car-form').classList.toggle('hidden');
}

function saveNewCar() {
    const model = document.getElementById('car-model').value;
    const price = document.getElementById('car-price').value;
    const image = document.getElementById('car-image').value;

    if(!model || !price || !image) return alert("يرجى إكمال البيانات");

    const newCar = {
        id: Date.now(),
        model: model,
        price: parseInt(price),
        available: true,
        image: image,
        specs: { transmission: "أوتوماتيك", fuel: "بنزين", seats: 5 }
    };

    cars.push(newCar);
    localStorage.setItem('rim_cars', JSON.stringify(cars));
    document.getElementById('car-form').classList.add('hidden');
    updateAdminPage();
    alert("تمت إضافة السيارة بنجاح");
}

function deleteCar(id) {
    if(confirm("هل أنت متأكد من حذف هذه السيارة؟")) {
        cars = cars.filter(c => c.id !== id);
        localStorage.setItem('rim_cars', JSON.stringify(cars));
        updateAdminPage();
    }
}

function toggleCarAvailability(id) {
    const car = cars.find(c => c.id === id);
    if(car) {
        car.available = !car.available;
        localStorage.setItem('rim_cars', JSON.stringify(cars));
        updateAdminPage();
    }
}

function updateAdminPage() {
    const list = document.getElementById('admin-cars-list');
    list.innerHTML = cars.map(c => `
        <div class="glass p-4 rounded-2xl border-white/5 flex justify-between items-center mb-3">
            <div class="flex items-center gap-3">
                <img src="${c.image}" class="w-12 h-12 rounded-xl object-cover">
                <div>
                    <p class="font-bold text-white text-sm">${c.model}</p>
                    <p class="text-[10px] ${c.available ? 'text-green-500' : 'text-red-500'}">${c.available ? 'متاحة' : 'محجوزة'}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="toggleCarAvailability(${c.id})" class="text-amber-500 p-2 glass rounded-lg"><i class="fas fa-sync"></i></button>
                <button onclick="deleteCar(${c.id})" class="text-red-500 p-2 glass rounded-lg"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    const bookingsList = document.getElementById('admin-bookings-list');
    if(!bookingsList) return;
    
    if(userBookings.length === 0) {
        bookingsList.innerHTML = '<div class="text-center py-10 text-slate-500 glass rounded-[30px]">لا توجد طلبات حجز حالياً</div>';
        return;
    }

    bookingsList.innerHTML = userBookings.map(b => `
        <div class="glass p-4 rounded-2xl border-white/5 text-[11px] flex justify-between items-center mb-3">
            <div>
                <p class="font-bold text-white">${b.carModel} <span class="text-amber-500 mx-1">←</span> ${b.userPhone}</p>
                <p class="text-slate-500 mt-1">${b.date}</p>
            </div>
            ${b.status === 'pending' ? 
                `<div class="flex gap-2">
                    <button onclick="approveBooking(${b.id})" class="bg-green-500 text-white px-3 py-2 rounded-xl font-bold shadow-lg">تأكيد</button>
                    <button onclick="rejectBooking(${b.id})" class="bg-red-500 text-white px-3 py-2 rounded-xl font-bold shadow-lg">رفض</button>
                </div>` : 
                (b.status === 'approved' ? 
                    `<span class="text-green-400 font-bold italic"><i class="fas fa-check-double ml-1"></i> تم التأكيد</span>` : 
                    `<span class="text-red-400 font-bold italic"><i class="fas fa-times-circle ml-1"></i> مرفوض</span>`
                )
            }
        </div>
    `).reverse().join('');
}

function approveBooking(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if(booking) {
        booking.status = 'approved';
        const car = cars.find(c => c.id === booking.carId);
        if(car) car.available = false;
        localStorage.setItem('rim_bookings', JSON.stringify(userBookings));
        localStorage.setItem('rim_cars', JSON.stringify(cars));
        updateAdminPage();
        alert("تم تأكيد الحجز بنجاح!");
    }
}

function rejectBooking(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if(booking) {
        booking.status = 'rejected';
        localStorage.setItem('rim_bookings', JSON.stringify(userBookings));
        updateAdminPage();
        alert("تم رفض الحجز وإخطار العميل.");
    }
}

// منطق المستخدم
function updateProfilePage() {
    if(!currentUser) return navigateTo('auth');
    document.getElementById('profile-phone-display').innerText = currentUser.phone;
    document.getElementById('user-initial').innerText = currentUser.phone[0];
    document.getElementById('user-bookings-count').innerText = userBookings.filter(b => b.userPhone === currentUser.phone).length;
}

function updateBookingsPage() {
    if(!currentUser) return navigateTo('auth');
    const list = document.getElementById('user-bookings-list');
    const myBookings = userBookings.filter(b => b.userPhone === currentUser.phone);
    if(myBookings.length === 0) return list.innerHTML = '<div class="text-center py-20 text-slate-500 glass rounded-[30px]">لا توجد رحلات محجوزة</div>';

    list.innerHTML = myBookings.map(b => {
        const ok = b.status === 'approved';
        const rejected = b.status === 'rejected';
        
        let statusText = 'قيد الانتظار';
        let statusClass = 'text-amber-500 border-amber-500/20 bg-amber-500/5';
        let iconClass = 'fa-clock';
        let iconBg = 'bg-slate-800';

        if (ok) {
            statusText = 'مؤكد';
            statusClass = 'text-green-400 border-green-400/20 bg-green-400/5';
            iconClass = 'fa-check';
            iconBg = 'premium-gradient shadow-amber-500/20';
        } else if (rejected) {
            statusText = 'مرفوض';
            statusClass = 'text-red-400 border-red-400/20 bg-red-400/5';
            iconClass = 'fa-times';
            iconBg = 'bg-red-500/20';
        }

        return `
            <div class="glass rounded-[30px] p-6 border-white/5 flex justify-between items-center mb-4 shadow-xl">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 ${iconBg} rounded-full flex items-center justify-center text-white">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-base">${b.carModel}</h4>
                        <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">${b.date}</p>
                    </div>
                </div>
                <div class="text-[10px] px-4 py-2 rounded-full border ${statusClass} font-bold uppercase tracking-widest">
                    ${statusText}
                </div>
            </div>
        `;
    }).reverse().join('');
}

function renderCars() {
    const grid = document.getElementById('cars-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    cars.filter(c => !showOnlyAvailable || c.available).forEach(car => {
        const card = document.createElement('div');
        card.className = `glass rounded-[40px] overflow-hidden flex flex-col border border-white/5 shadow-2xl relative ${!car.available ? 'opacity-50 grayscale' : ''}`;
        card.innerHTML = `
            <div class="relative h-64 cursor-pointer" onclick="openImagePreview('${car.image}')">
                <img src="${car.image}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                <div class="absolute bottom-6 right-8">
                    <span class="text-amber-500 font-bold text-2xl">${car.price}</span>
                    <span class="text-[10px] text-slate-400 uppercase tracking-widest mr-1">ر.س / يوم</span>
                </div>
            </div>
            <div class="p-8">
                <h3 class="text-xl font-bold mb-4 text-white">${car.model}</h3>
                <button onclick="bookCar(${car.id})" class="w-full py-5 rounded-[22px] font-bold transition-all ${car.available ? 'premium-gradient text-white shadow-xl shadow-amber-600/20' : 'bg-slate-800 text-slate-500'}" ${!car.available ? 'disabled' : ''}>
                    ${car.available ? 'احجز الآن' : 'غير متوفرة'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function bookCar(id) {
    if(!currentUser) return navigateTo('auth');
    selectedCarId = id;
    const car = cars.find(c => c.id === id);
    const modal = document.getElementById('booking-modal');
    document.getElementById('modal-title').innerText = car.model;
    document.getElementById('modal-details').innerHTML = `قيمة الإيجار اليومي لهذه السيارة هي <span class="text-amber-500 font-bold">${car.price} ريال</span>. سيتم مراجعة طلبك من قبل الإدارة فور التأكيد.`;
    modal.classList.remove('hidden');
    setTimeout(() => modal.querySelector('.glass').style.transform = 'translateY(0)', 10);
}

function confirmBooking() {
    const car = cars.find(c => c.id === selectedCarId);
    userBookings.push({ 
        id: Date.now(), 
        userPhone: currentUser.phone, 
        carId: car.id, 
        carModel: car.model, 
        date: new Date().toLocaleDateString('ar-SA'), 
        status: 'pending' 
    });
    localStorage.setItem('rim_bookings', JSON.stringify(userBookings));
    alert("✅ تم إرسال طلب الحجز! بانتظار موافقة الإدارة.");
    closeModal();
    navigateTo('cars', document.querySelectorAll('.nav-btn')[1]);
}

function closeModal() {
    const modal = document.getElementById('booking-modal');
    const content = modal.querySelector('.glass');
    if(content) content.style.transform = 'translateY(100%)';
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function openImagePreview(src) { 
    document.getElementById('full-image').src = src; 
    document.getElementById('image-preview-modal').classList.remove('hidden'); 
}
function closeImagePreview() { document.getElementById('image-preview-modal').classList.add('hidden'); }
function toggleFilter() { showOnlyAvailable = document.getElementById('filter-available').checked; renderCars(); }

function handleSearch(q) {
    const searchTerm = q.toLowerCase();
    const filtered = cars.filter(c => c.model.toLowerCase().includes(searchTerm));
    const grid = document.getElementById('cars-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(filtered.length === 0) {
        grid.innerHTML = '<div class="text-center py-20 text-slate-500 glass rounded-[30px]">عذراً، لا توجد نتائج مطابقة</div>';
        return;
    }

    filtered.forEach(car => {
        const card = document.createElement('div');
        card.className = `glass rounded-[40px] overflow-hidden flex flex-col border border-white/5 mb-6 relative ${!car.available ? 'opacity-50 grayscale' : ''}`;
        card.innerHTML = `
            <div class="relative h-64"><img src="${car.image}" class="w-full h-full object-cover"></div>
            <div class="p-8"><h3 class="text-xl font-bold text-white mb-4">${car.model}</h3>
            <button onclick="bookCar(${car.id})" class="w-full py-5 rounded-[22px] premium-gradient text-white font-bold">حجز الآن</button></div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', renderCars);
