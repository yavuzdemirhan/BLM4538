ALTER TABLE Favorites ALTER COLUMN TourTitle nvarchar(max) NULL;
ALTER TABLE Favorites ALTER COLUMN TourImage nvarchar(max) NULL;
ALTER TABLE Participations ALTER COLUMN TourTitle nvarchar(max) NULL;
PRINT 'Kolonlar nullable yapildi.';
