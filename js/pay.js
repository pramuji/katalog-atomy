window.PAY = {
  key: "h6SSnsB4f0ddcf6c89834201ToTYCiLj",
  base: "https://api-sandbox.collaborator.komerce.id/user/api/v1/user/payment",
  async create(payload) {
    const r = await fetch(this.base + "/create", {
      method: "POST",
      headers: { "x-api-key": this.key, "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: payload.orderId,
        payment_type: "qris",
        channel_code: "qris",
        amount: payload.amount,
        customer: {
          name: payload.name,
          email: payload.phone.replace(/\D/g, "") + "@katalogatomy.online",
          phone: payload.phone
        },
        items: payload.items,
        expiry_duration: 3600
      })
    });
    return r.json();
  },
  async status(id) {
    const r = await fetch(this.base + "/status/" + encodeURIComponent(id), {
      headers: { "x-api-key": this.key }
    });
    return r.json();
  }
};
