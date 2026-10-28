CREATE DATABASE IF NOT EXISTS stockbridge;
USE stockbridge;

CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  quantity INT NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'units',
  price DECIMAL(10,2) NOT NULL,
  location VARCHAR(100) NOT NULL,
  seller VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('Available','Reserved','Closed') NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  buyer_email VARCHAR(150) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

INSERT INTO listings (title, category, quantity, unit, price, location, seller, description)
SELECT * FROM (
  SELECT 'Recycled corrugated cartons', 'Packaging', 800, 'boxes', 8.50, 'Nashik, Maharashtra', 'GreenPack Supplies', 'Clean, unused cartons available in bulk. Ideal for shipping and storage.' UNION ALL
  SELECT 'A4 copier paper - surplus', 'Stationery', 120, 'reams', 185.00, 'Pune, Maharashtra', 'OfficeHub Traders', 'Sealed A4 paper packs from excess procurement.' UNION ALL
  SELECT 'Food-grade glass jars', 'Containers', 600, 'jars', 12.00, 'Mumbai, Maharashtra', 'Metro Containers', 'Unused jars in original cartons. Buyer to verify specifications.' UNION ALL
  SELECT 'Cotton tote bags', 'Textiles', 250, 'bags', 32.00, 'Aurangabad, Maharashtra', 'Local Loom Co.', 'Plain cotton bags from a cancelled bulk order.'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM listings LIMIT 1);


CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  academic_year VARCHAR(30) NOT NULL,
  department VARCHAR(100) NOT NULL,
  interest VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category ENUM('Workshop','Networking','Showcase','Webinar') NOT NULL,
  event_date DATE NOT NULL,
  location VARCHAR(120) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events (title, category, event_date, location, description)
SELECT * FROM (
 SELECT 'Circular Supply Chain Workshop','Workshop', DATE_ADD(CURDATE(), INTERVAL 3 DAY),'Innovation Lab','Map surplus materials to potential local demand.' UNION ALL
 SELECT 'Small Business Networking Hour','Networking', DATE_ADD(CURDATE(), INTERVAL 7 DAY),'Seminar Hall','Meet local founders and operations teams.' UNION ALL
 SELECT 'Student Product Showcase','Showcase', DATE_ADD(CURDATE(), INTERVAL 12 DAY),'Main Auditorium','Present practical prototypes and learn from peers.' UNION ALL
 SELECT 'Blockchain for Traceability','Webinar', DATE_ADD(CURDATE(), INTERVAL 18 DAY),'Online','An introductory session on recording references on-chain.'
) AS seed_events
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);
