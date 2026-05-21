ALTER TABLE producto
  ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);

ALTER TABLE diseno
  ALTER COLUMN imagen TYPE TEXT;

UPDATE producto SET imagen = 'https://placehold.co/800x500/c1121f/ffffff?text=Spain+Flag' WHERE id_producto = 1;
UPDATE producto SET imagen = 'https://placehold.co/800x500/457b9d/ffffff?text=Event+Canvas+Banner' WHERE id_producto = 2;
UPDATE producto SET imagen = 'https://placehold.co/800x500/2d6a4f/ffffff?text=Andalusia+Flag' WHERE id_producto = 3;
UPDATE producto SET imagen = 'https://placehold.co/800x500/343a40/ffffff?text=Company+Large+Canvas' WHERE id_producto = 4;
UPDATE producto SET imagen = 'https://placehold.co/800x500/003399/ffcc00?text=EU+Flag' WHERE id_producto = 5;
UPDATE producto SET imagen = 'https://placehold.co/800x500/f77f00/ffffff?text=Trade+Fair+Canvas' WHERE id_producto = 6;
UPDATE producto SET imagen = 'https://placehold.co/800x500/fcbf49/003049?text=Valencia+Flag' WHERE id_producto = 7;
UPDATE producto SET imagen = 'https://placehold.co/800x500/6c757d/ffffff?text=Interior+Canvas' WHERE id_producto = 8;
UPDATE producto SET imagen = 'https://placehold.co/800x500/f4d35e/c1121f?text=Catalonia+Flag' WHERE id_producto = 9;
UPDATE producto SET imagen = 'https://placehold.co/800x500/00a6fb/ffffff?text=Outdoor+Canvas' WHERE id_producto = 10;

UPDATE diseno SET imagen = 'https://img.freepik.com/vector-gratis/fondo-decorativo-bandera-fiesta-diseno-confeti_1017-44172.jpg?semt=ais_hybrid&w=740&q=80' WHERE id_diseno = 1;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/1d4ed8/ffffff?text=Company+Event' WHERE id_diseno = 2;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/2d6a4f/ffffff?text=Eco+Campaign' WHERE id_diseno = 3;
UPDATE diseno SET imagen = 'https://img.freepik.com/vector-gratis/fondo-minimalista-diseno-plano_23-2149987673.jpg' WHERE id_diseno = 4;
UPDATE diseno SET imagen = 'https://image.slidesdocs.com/responsive-images/background/summer-paper-cut-beach-cartoon-blue-dabble-nature-powerpoint-background_929749e932__960_540.jpg' WHERE id_diseno = 5;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/2563eb/ffffff?text=Concert' WHERE id_diseno = 6;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/16a34a/ffffff?text=Fair+Design' WHERE id_diseno = 7;
UPDATE diseno SET imagen = 'https://static.vecteezy.com/system/resources/previews/009/007/075/non_2x/elegant-abstract-background-for-graphic-or-web-design-that-will-make-your-designs-look-professional-vector.jpg' WHERE id_diseno = 8;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/facc15/111111?text=Advertising' WHERE id_diseno = 9;
UPDATE diseno SET texto = 'Premium brand', imagen = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtnnBdWPkddZqSuE2tc11bq6lr0PRLlihQmQ&s' WHERE id_diseno = 10;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/d62828/ffffff?text=Custom+Design+11' WHERE id_diseno = 11;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/0077b6/ffffff?text=Custom+Design+12' WHERE id_diseno = 12;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/40916c/ffffff?text=Custom+Design+13' WHERE id_diseno = 13;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/111111/ffffff?text=Custom+Design+14' WHERE id_diseno = 14;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/e63946/ffffff?text=Custom+Design+15' WHERE id_diseno = 15;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/0077b6/ffffff?text=Custom+Design+16' WHERE id_diseno = 16;
UPDATE diseno SET imagen = 'https://placehold.co/800x500/2d6a4f/ffffff?text=Custom+Design+17' WHERE id_diseno = 17;
