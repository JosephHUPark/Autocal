function extractDates(text) {
  const datePattern = /\b(?:\d{1,2}[\/\-,]?\d{1,2}[\/\-,]?\d{4})|(?:\d{4}[\/\-,]?\d{1,2}[\/\-,]?\d{1,2})|(?:\d{1,2}(?:st|nd|rd|th)?\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4})|(?:\d{1,2}(?:st|nd|rd|th)?\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4})|(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2}(?:,)?\s\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2}(?:,)?\s\d{4})\b/gi;
  const matches = [...text.matchAll(datePattern)];
  return matches.map(match => match[0]);
}

function parseAndFormatDate(dateString) {
  let date;
  const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateString)) {
      date = new Date(dateString);
  } else if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(dateString)) {
      date = new Date(dateString);
  } else if (/^\d{1,2}(?:st|nd|rd|th)?\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/i.test(dateString)) {
      const [day, month, year] = dateString.split(' ');
      date = new Date(`${year}-${months[month.slice(0, 3)]}-${day.padStart(2, '0')}`);
  } else if (/^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2}(?:,)?\s\d{4}$/i.test(dateString)) {
      const [month, day, year] = dateString.replace(',', '').split(' ');
      date = new Date(`${year}-${months[month.slice(0, 3)]}-${day.padStart(2, '0')}`);
  }

  if (date && !isNaN(date.getTime())) {
      const now = new Date();
      if (date >= now) {
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const yyyy = date.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
      }
  }
  return null;
}

function addInfoButtons(dates) {
  const uniqueDates = new Set(dates);
  
  uniqueDates.forEach(date => {
      const formattedDate = parseAndFormatDate(date);
      if (formattedDate) { 
          document.body.innerHTML = document.body.innerHTML.replace(
              new RegExp(`(${date})`, 'g'),
              `<span class="date-highlight">$1<button class="info-button" style="margin-left: 5px; font-size: 10px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 3px;">info</button></span>`
          );
      }
  });

  document.querySelectorAll('.info-button').forEach(button => {
      button.addEventListener('click', (event) => {
          event.stopPropagation();
          const dateText = button.previousSibling.textContent;

          document.querySelectorAll(".date-popup").forEach(popup => popup.remove());

          const popup = document.createElement("div");
          popup.className = "date-popup";
          popup.innerHTML = `
              <label>Event Title:</label><br>
              <input type="text" id="event-title" style="width: 200px; margin-top: 5px;" placeholder="Enter event title"><br>
              <button id="save-event" style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Save to Calendar</button>
          `;
          popup.style.cssText = `
              position: fixed;
              background-color: white;
              border: 1px solid black;
              padding: 12px;
              font-size: 12px;
              border-radius: 5px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
              z-index: 10000;
              top: ${event.clientY + window.scrollY + 10}px;
              left: ${event.clientX + window.scrollX + 10}px;
          `;

          document.body.appendChild(popup);

          document.getElementById("save-event").addEventListener("click", () => {
              const title = document.getElementById("event-title").value;
              if (!title) {
                  alert("Please enter an event title.");
                  return;
              }

              const [month, day, year] = dateText.split("/");
              const formattedForCalendar = `${year}${month}${day}`;

              const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${formattedForCalendar}/${formattedForCalendar}&text=${encodeURIComponent(title)}`;
              window.open(calendarUrl, "_blank");

              popup.remove();
          });

          const closePopup = (e) => {
              if (!popup.contains(e.target) && e.target !== button) {
                  popup.remove();
                  document.removeEventListener("click", closePopup);
              }
          };
          setTimeout(() => document.addEventListener("click", closePopup), 10);
      });
  });
}

function processPage() {
  const text = document.body.innerText;
  const dates = extractDates(text);
  addInfoButtons(dates);
}

processPage();
