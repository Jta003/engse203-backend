const express = require('express');
const app = express();
const PORT = 3001;

// =============================
// Mock Data: agent list
// =============================
let agents = [
   {
    code: "A001",        // รหัส Agent
    name: "Thanit",      // ชื่อ Agent
    status: "Available", // สถานะเริ่มต้น
    loginTime: new Date()
   },
   {
    code: "A002",        // รหัส Agent
    name: "Alex",
    status: "Wrap up",   // ต้องให้ตรงกับ validStatuses
    loginTime: new Date()
   },
   {
    code: "A003",        // รหัส Agent
    name: "Jeny",
    status: "Active",
    loginTime: new Date()
   },
];

// =============================
// Middleware
// =============================
// ทำหน้าที่แปลง JSON ที่ส่งมาใน request body
// ให้กลายเป็น JavaScript object โดยอัตโนมัติ
app.use(express.json());

// =============================
// API: PATCH เปลี่ยนสถานะ Agent
// =============================
// URL ตัวอย่าง: http://localhost:3001/api/agents/A001/status
app.patch('/api/agents/:code/status', (req, res) => {
    // Step 1: ดึง agent code จาก URL
    const agentCode = req.params.code;

    // Step 2: ดึง status ใหม่จาก request body
    const newStatus = req.body.status;
    
    console.log('Agent Code:', agentCode);
    console.log('New Status:', newStatus);

    // Step 3: หา agent ในระบบจาก code
    const agent = agents.find(a => a.code === agentCode);
    console.log('found agent:', agent);

    // Step 4: ตรวจสอบว่าเจอ agent ไหม
    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found"
        });
    }

    // Step 5: ตรวจสอบว่า status ที่ส่งมา valid ไหม
    const validStatuses = ["Available", "Active", "Wrap up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status",
            validStatuses: validStatuses
        });
    }  
    
    // Step 6: เก็บสถานะเดิมไว้ (เพื่อ log)
    const oldStatus = agent.status;

    // Step 7: อัปเดต status และเวลาที่เปลี่ยน
    agent.status = newStatus;
    agent.lastStatusChange = new Date();
    
    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    // Step 8: ส่ง response กลับไปที่ client
    res.json({
        success: true,
        message: `Agent ${agentCode} status changed from ${oldStatus} to ${newStatus}`,
        data: agent
    });
});

app.get('/api/dashboard/stats', (req, res) => {
    // ขั้นที่ 1: นับจำนวนรวม
    const totalAgents = agents.length; // เติม
    
    // ขั้นที่ 2: นับ Available agents
    const available = agents.filter(a => a.status === "Available").length; // เติม
    const active = agents.filter(a => a.status === "Active").length;
    const wrapUp = agents.filter(a => a.status === "WrapUp").length;
    const notReady = agents.filter(a => a.status === "NotReady").length;
    const offline = agents.filter(a => a.status === "Offline").length;
    // ให้นักศึกษาเขียน active, wrapUp, notReady, offline เอง
    
    // ขั้นที่ 3: คำนวณเปอร์เซ็นต์  
    const availablePercent = totalAgents > 0 ? 
        Math.round((available / totalAgents) * 100) : 0;
    const activePercent = totalAgents > 0 ? 
        Math.round((active / totalAgents) * 100) : 0;
    const wrapUpPercent = totalAgents > 0 ? 
        Math.round((wrapUp / totalAgents) * 100) : 0;
    const notReadyPercent = totalAgents > 0 ? 
        Math.round((notReady / totalAgents) * 100) : 0;
    const offlinePercent = totalAgents > 0 ? 
        Math.round((offline / totalAgents) * 100) : 0;
    // ให้นักศึกษาทำส่วนอื่นเอง... 
        res.json({
        totalAgents,
        available, active, wrapUp, notReady, offline,
        availablePercent, activePercent, wrapUpPercent, notReadyPercent, offlinePercent
        });
});

// =============================
// API: GET agent ทั้งหมด
// =============================
// URL: http://localhost:3001/api/agents
app.get('/api/agents', (req, res) => {
    res.json({
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// =============================
// API: GET จำนวน agent
// =============================
// URL: http://localhost:3001/api/agents/count
app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// =============================
// Routes ทั่วไป (Test Endpoint)
// =============================
app.get('/', (req, res) => {
    res.send(`Hello Agent Wallboard!`);
});

app.get('/hello', (req, res) => {
    res.send(`Hello สวัสดี!`);
});

app.get('/health', (req, res) => {
    res.send({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});

// =============================
// Start server
// =============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
