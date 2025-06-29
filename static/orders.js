const API_BASE = "/api";

const userId = localStorage.getItem("user_id");

async function loadOrders() {
    if (!userId) {
       document.getElementById("ordersList").innerHTML = `<p>Please <a href="/" class="text-blue-500 underline">login</a> to view your bookings.</p>`;

        return;
    }

    try {
        const res = await fetch(`${API_BASE}/get_orders?user_id=${userId}`);
        const data = await res.json();

        if (data.status !== "success" || data.orders.length === 0) {
            document.getElementById("ordersList").innerHTML = `<p>No bookings found.</p>`;
            return;
        }

        const ordersList = document.getElementById("ordersList");
        ordersList.innerHTML = "";

        data.orders.forEach(order => {
            const card = document.createElement("div");
            card.className = "bg-white rounded-lg shadow-md flex flex-col md:flex-row overflow-hidden";

            card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w300${order.poster_path}" class="w-full md:w-40 object-cover" alt="${order.movie_title}" />

            <div class="flex-1 p-4 space-y-2">
              <h3 class="text-xl font-semibold">${order.movie_title}</h3>
              <p><strong>Date:</strong> ${order.show_date}</p>
              <p><strong>Time:</strong> ${order.show_time}</p>
              <p><strong>Seats:</strong> ${order.seats}</p>
              <p><strong>Price:</strong> ₹${order.price}</p>
            </div>

            <div class="p-4 flex justify-center items-center">
              <img src="${order.qr_code}" alt="QR Code" class="w-24 h-24" />
            </div>
          `;

            ordersList.appendChild(card);
        });

    } catch (err) {
        console.error("Failed to fetch orders:", err);
        document.getElementById("ordersList").innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    }
}

loadOrders()