# **🧾 Statement of Work (SOW)**

**Project Title:** Warranty Management Web Portal Enhancements

**Client:** \[Client Name\]

**Developer:** \[Developer Name\]

**Start Date:** \[Insert Date\]

**Estimated Duration:** \[Insert Timeline\]

**Primary Language:** English (Indian developer preferred for timezone & communication alignment)

---

## **1\. 🔍 Project Overview**

The existing warranty management system supports three types of user roles: Admin, Agent/Dealer, and Salesperson. Each role has varying permissions. The client has provided specific feedback on usability issues, missing functionality, and system errors, particularly regarding the Add Warranty flow.

The purpose of this SOW is to define and deliver feature upgrades, bug fixes, and improved workflows to enhance system performance and usability.

Working Folder [https://drive.google.com/drive/folders/14AZx1WRTOymhGpLZQnVa0kQnUB\_ItYbs?usp=drive\_link](https://drive.google.com/drive/folders/14AZx1WRTOymhGpLZQnVa0kQnUB_ItYbs?usp=drive_link)

---

## **2\. 👥 User Role Access Summary**

| Role | Access Level | Key Features |
| ----- | ----- | ----- |
| Salesperson | Limited | Dashboard (News, Products, Stock), Add/Search Warranties, View own company warranties, Access Resources |
| Dealer/Agent | Medium | All Salesperson features \+ Add/Manage Salespeople, View performance metrics |
| Admin | Full | All features including data visibility across agents, stock control, product and warranty management |

---

## **3\. 🔧 Scope of Work**

### **A. 🔑 Login & Access Logic**

* Ensure role-based access is correctly applied across Admin, Dealer/Agent, and Salesperson logins.  
* Hide “Dealer” dropdown field from non-admin roles on Add Warranty form.

### **B. 🧾 Warranty Module Overhaul**

### **Add Warranty Form:**

* **Rebuild the Add Warranty Form UI/UX** to be intuitive and error-proof.  
* Automatically open “Add Warranty” form when the menu item is selected.  
* Form buttons:  
  * `Add & Print`  
  * `Cancel`  
* Implement **smart form validation**:  
  * “Add” button greyed out until all mandatory fields are filled.  
  * Display user-friendly error messages instead of system errors.

### **Mandatory Fields:**

Mark the following fields as required with red asterisks:

* State, Postcode, Country  
* Owner’s Email  
* Registration Number (use full label, not "No")  
* VIN Number  
* Vehicle Make/Model (Dropdown \+ Typeahead)  
* Year (Change to: "Compliance Date")  
* Owner’s Mobile

### **Address Autocomplete:**

* Integrate smart address input with Google Places API or similar  
* Auto-fill State and Postcode from selected address

### **Product Selection Flow:**

* After clicking "Add":  
  * Automatically open next popup for product selection  
  * Select Warranty Type  
  * Generate PDF of warranty form including selected conditions  
  * Implement ability to upload signed copy of warranty form (PDF/image upload)

### **C. 📈 Dashboard Enhancements (Not Yet Built)**

* Build dashboards for:  
  * Sales performance  
  * Monthly progress (per salesperson and agent view)

### **D. 📁 Warranty PDF Generator**

* Generate a PDF of warranty form upon form submission  
* Include warranty conditions based on product  
* Ensure compatibility with print and digital signature process

### **E. 🐛 Bug Fixes & QA**

* Investigate and resolve:  
  * Intermittent Add Warranty form submission failures  
  * Form submission showing blank error pages  
* Integrate QA testing steps with client-provided testing logs  
* Add robust form error handling for all edge cases

---

## **4\. 🗂 Deliverables**

1. Redesigned and functional Add Warranty form with validation  
2. Product and warranty type selection module (linked to Add flow)  
3. PDF generation and digital copy upload capability  
4. Smart address and vehicle dropdown system  
5. Sales dashboards (Phase 2\)  
6. Bug-free, role-based access system  
7. Clear error messages and success notifications

---

## **5\. 📆 Timeline & Milestones**

| Milestone | Deadline (TBC) |
| ----- | ----- |
| Form rebuild with validation | Week 1–2 |
| Smart address & dropdown fields | Week 2–3 |
| Product selection & PDF output | Week 3–4 |
| File upload integration | Week 4 |
| Dashboards & analytics (optional) | Week 5+ |
| Final QA and deployment | Week 6 |

---

## **6\. 📢 Communication & Language**

* All communication in English (with consideration for Indian English).  
* Weekly updates via \[preferred platform: WhatsApp, Slack, Email\].  
* Daily stand-ups optional via Google Meet/Zoom depending on urgency.

---

## **7\. 💰 Payment Terms**

* 30% deposit upfront  
* 40% on staging deployment  
* 30% on final approval and handover

\[Include actual currency and rates depending on agreement\]

---

## **8\. 🛠 Tech Stack & Tools**

* Frontend: HTML/CSS/JavaScript (Framework: \[e.g., React or plain PHP\])  
* Backend: PHP / Laravel / Node.js  
* Database: MySQL  
* PDF Generator: \[e.g., DomPDF, jsPDF\]  
* Smart Inputs: Google Places API  
* Hosting: \[Client Hosting\]

---

## **9\. 🔒 Confidentiality & IP**

All code, designs, and documents developed during this project remain the property of \[Client Name\].

---

## **10\. ✅ Acceptance Criteria**

* All bugs from client testing log resolved  
* Warranty form process is smooth and error-free  
* Required fields enforced with validation  
* PDFs generate correctly and are printable  
* Dashboard working and reflecting accurate metrics  
* Positive final client walkthrough and sign-off

