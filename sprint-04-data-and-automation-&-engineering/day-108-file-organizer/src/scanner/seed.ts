import fs   from 'fs';
import path from 'path';

const SAMPLE_DIR = path.resolve('./sample-dir/mixed');

const FILES = [
    // Images
    'photo_lagos_beach.jpg', 'family_photo.png', 'logo_design.svg',
    'product_shot.webp', 'screenshot.png', 'wallpaper.jpeg',
    // Documents
    'cv_henry_2025.pdf', 'project_proposal.docx', 'budget_q1.xlsx',
    'meeting_notes.txt', 'presentation_slides.pptx',
    // Code
    'index.ts', 'app.js', 'styles.css', 'README.md',
    'config.json', 'schema.sql', 'deploy.sh',
    // Audio
    'afrobeats_mix.mp3', 'podcast_ep42.m4a', 'voice_note.wav',
    // Videos
    'vacation_clip.mp4', 'tutorial_react.mov',
    // Archives
    'project_backup.zip', 'logs_archive.tar.gz',
    // Data
    'sales_data.csv', 'users_export.csv', 'database.sqlite',
    // Fonts
    'Poppins-Regular.ttf', 'Roboto-Bold.woff2',
    // Misc
    'random_file.xyz', 'no_extension',
];

function seed(): void {
    fs.mkdirSync(SAMPLE_DIR, { recursive: true });

    let created = 0;
    for (const file of FILES) {
        const filePath = path.join(SAMPLE_DIR, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, `Sample content for ${file}\nCreated by Day 108 File Organizer seeder.\n`, 'utf-8');
            created++;
        }
    }

    console.log(`[Seed] Created ${created} sample files in: ${SAMPLE_DIR}`);
    console.log(`[Seed] Total files: ${fs.readdirSync(SAMPLE_DIR).length}`);
}

seed();