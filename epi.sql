CREATE TABLE type_epi (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(255) NOT NULL,
    periodicite_controle INTEGER NOT NULL,
    est_textile BOOLEAN NOT NULL
);

CREATE TABLE gestionnaire (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE statut_controle (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(255) NOT NULL
);

CREATE TABLE epi (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    identifiant_perso VARCHAR(255) NOT NULL,
    marque VARCHAR(255) NOT NULL,
    modele VARCHAR(255) NOT NULL,
    numero_serie VARCHAR(255) NOT NULL,
    taille VARCHAR(255),
    couleur VARCHAR(255),
    date_achat DATE,
    date_fabrication DATE,
    date_mise_service DATE,
    periodicite_controle INTEGER,
    type_epi_id INTEGER NOT NULL,
    FOREIGN KEY (type_epi_id) REFERENCES type_epi(id)
);

CREATE TABLE controle (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    date_controle DATE NOT NULL,
    remarques TEXT,
    gestionnaire_id INTEGER NOT NULL,
    epi_id INTEGER NOT NULL,
    statut_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gestionnaire_id) REFERENCES gestionnaire(id),
    FOREIGN KEY (epi_id) REFERENCES epi(id),
    FOREIGN KEY (statut_id) REFERENCES statut_controle(id)
);

INSERT INTO statut_controle (libelle) VALUES
('Opérationnel'),
('A réparer'),
('Mis au rebut');