import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');

  // Fetch data from localhost:8080
  let data = 'Test1, Test2, Test3'; // Default data in case fetch fails
  try {
    const response = await fetch('http://localhost:8080/');
    if (response.ok) {
      const fetchedData = await response.json();
      data = fetchedData;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    li.append(data);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
