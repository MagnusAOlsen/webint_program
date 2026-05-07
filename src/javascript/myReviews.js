fetchReviews().then(reviews => {

  reviews.sort((a, b) => {
      const dateA = convertDate(a.date);
      const dateB = convertDate(b.date);
      return dateB - dateA; 
  });

  displayReviews(reviews, '#wineBoxes');
});

function convertDate(dateString) {
  const [day, month, year] = dateString.split('.');
  return new Date(`${year}-${month}-${day}`);
}


const stars = document.querySelectorAll('.star');

stars.forEach(s => {
  s.addEventListener('mouseenter', () => {
    stars.forEach(s2 => s2.classList.toggle('lit', +s2.dataset.val <= +s.dataset.val));
  });

  s.addEventListener('mouseleave', () => {
    stars.forEach(s2 => s2.classList.remove('lit'));
  });
});

const filterBtn = document.getElementById('filterButton');
const form = document.getElementById('searchWine');
filterBtn.addEventListener('click', () => {
    form.classList.toggle('hidden');
    backdrop.classList.toggle('hidden');
  });

backdrop.addEventListener('click', () => {
    form.classList.add('hidden');
    backdrop.classList.add('hidden');
});

const addWineBtn = document.getElementById('addWineButton');
addWineBtn.addEventListener('click', () => {
    form.classList.toggle('hidden');
    backdrop.classList.toggle('hidden');
});

