const nowLagosStr = new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' });
const nowLagos = new Date(nowLagosStr);
const nowMinutes = nowLagos.getHours() * 60 + nowLagos.getMinutes();
console.log("String:", nowLagosStr);
console.log("Date:", nowLagos);
console.log("Hours:", nowLagos.getHours(), "Minutes:", nowLagos.getMinutes());
console.log("nowMinutes:", nowMinutes);
