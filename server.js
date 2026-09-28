const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Video Directory
const VIDEO_DIR = path.join(__dirname, 'ผลงานคลิปที่เคยทำ');

// Preset metadata for known video files matching Chatdanai's resume projects
const VIDEO_METADATA_PRESETS = {
  'Arokago.mp4': {
    title: 'ArokaGO — Medical & Wellness Tourism Platform',
    category: 'commercial',
    categoryLabel: 'Commercial / แพลตฟอร์ม',
    description: 'ผลงานจัดทำคลิปโปรโมทแพลตฟอร์ม ArokaGO (Medical and Wellness Tourism Platform) จัดวางจังหวะภาพยนตร์ เกรดสีเน้นความน่าเชื่อถือและความสบายตา สอดคล้องกับการท่องเที่ยวเชิงสุขภาพระดับพรีเมียม',
    tools: ['Adobe Premiere Pro', 'CapCut Pro'],
    highlight: 'Platform Promo',
    badge: 'Featured'
  },
  'coco pop.mp4': {
    title: 'COCO LOVE — Love Yourself Drink For Your Health',
    category: 'commercial',
    categoryLabel: 'Viral Contest / โฆษณา',
    description: 'ผลงานการประกวดคลิปไวรัลสุดสร้างสรรค์ COCO LOVE "Love yourself Drink For your health" คอนเซปต์สดใส ดึงดูดความสนใจตั้งแต่ 3 วินาทีแรก (Hook-first Concept) เพื่อสร้างยอดวิวและการมีส่วนร่วม',
    tools: ['Adobe Premiere Pro', 'After Effects', 'Viral Motion', 'Creative Cut'],
    highlight: 'Viral Contest Entry',
    badge: 'Contest Project'
  },
  'Food.mp4': {
    title: 'Food Content & Storytelling — จังหวะภาพ & ซับไตเติลแม่นยำ',
    category: 'subtitle',
    categoryLabel: 'Food Story / ซับไตเติล',
    description: 'ผลงานวิดีโอแนว Food Storytelling เล่าเรื่องอาหารอย่างมีชีวิตชีวา โชว์การวางจังหวะซับไตเติลที่เป๊ะตามเสียงพูด (Timing Precision) ตัดต่อตามจังหวะเสียง ซาวด์ดีไซน์แน่น ชวนให้น่าติดตามตลอดทั้งคลิป',
    tools: ['Adobe Premiere Pro', 'CapCut Pro', 'Precision Subtitles', 'Sound Design'],
    highlight: 'Precision Timing & Subtitles',
    badge: 'Masterwork'
  },
  'มหานาค.mp4': {
    title: 'Nitade DPU "มหานาคผ่านเลนส์ จากรอย...สู่เรื่อง" — สารคดีสั้น & ซับไตเติล 2 ภาษา',
    category: 'cinematic',
    categoryLabel: 'สารคดีสั้น / ประกวดนิเทศ DPU',
    description: 'ผลงานโครงการประกวดสร้างสรรค์คลิปวิดีโอ "มหานาคผ่านเลนส์ จากรอย...สู่เรื่อง" โดยคณะนิเทศศาสตร์ มหาวิทยาลัยธุรกิจบัณฑิตย์ (DPU) เล่าเรื่องราววิถีชีวิตและภูมิปัญญาช่างฝีมือชุมชนบ้านบาตร มหานาค โดดเด่นด้วยการเกรดสีภาพยนตร์ (Cinematic Grading), คุมจังหวะภาพที่ลึกซึ้ง (Pacing), บันทึกเสียงบรรยากาศสมจริง และการใส่ซับไตเติล 2 ภาษา (ไทย-อังกฤษ) อย่างแม่นยำประณีต',
    tools: ['Adobe Premiere Pro', 'Adobe After Effects', 'Bilingual Subtitles', 'Cinematic Grading', 'Sound Design'],
    highlight: 'DPU Award Entry • ซับไตเติล 2 ภาษา',
    badge: 'Award Project'
  },
  'animation.mp4': {
    title: 'Sweet Treats & Food Truck — 2D Motion Animation (60 FPS)',
    category: 'motion',
    categoryLabel: 'โมชันกราฟิก & แอนิเมชัน',
    description: 'ผลงานสร้างสรรค์โมชันกราฟิกและแอนิเมชันแนวขนมหวานและรถไอศกรีม (Sweet Treats & Food Truck) ออกแบบการเคลื่อนไหวที่นุ่มนวล สนุกสนาน คุมโทนสีพาสเทลสดใส โชว์ทักษะการจัดจังหวะแอนิเมชัน (Easing & Timing Curves), จัดวาง Typography และองค์ประกอบกราฟิกเคลื่อนไหว 60 FPS ลื่นไหลสบายตา',
    tools: ['Adobe After Effects', 'Motion Graphics 60FPS'],
    highlight: 'Cute Dessert Animation • 60 FPS',
    badge: 'Creative Motion'
  },
  'animation.MP4': {
    title: 'Sweet Treats & Food Truck — 2D Motion Animation (60 FPS)',
    category: 'motion',
    categoryLabel: 'โมชันกราฟิก & แอนิเมชัน',
    description: 'ผลงานสร้างสรรค์โมชันกราฟิกและแอนิเมชันแนวขนมหวานและรถไอศกรีม (Sweet Treats & Food Truck) ออกแบบการเคลื่อนไหวที่นุ่มนวล สนุกสนาน คุมโทนสีพาสเทลสดใส โชว์ทักษะการจัดจังหวะแอนิเมชัน (Easing & Timing Curves), จัดวาง Typography และองค์ประกอบกราฟิกเคลื่อนไหว 60 FPS ลื่นไหลสบายตา',
    tools: ['Adobe After Effects', 'Motion Graphics 60FPS'],
    highlight: 'Cute Dessert Animation • 60 FPS',
    badge: 'Creative Motion'
  },
  'ซับ2.mp4': {
    title: 'Food Content & Storytelling — จังหวะภาพ & ซับไตเติลแม่นยำ',
    category: 'subtitle',
    categoryLabel: 'Food Story / ซับไตเติล',
    description: 'ผลงานวิดีโอแนว Food Storytelling เล่าเรื่องอาหารอย่างมีชีวิตชีวา โชว์การวางจังหวะซับไตเติลที่เป๊ะตามเสียงพูด (Timing Precision) ตัดต่อตามจังหวะเสียง ซาวด์ดีไซน์แน่น ชวนให้น่าติดตามตลอดทั้งคลิป',
    tools: ['Adobe Premiere Pro', 'CapCut Pro', 'Precision Subtitles', 'Sound Design'],
    highlight: 'Precision Timing & Subtitles',
    badge: 'Masterwork'
  }
};

const VIDEO_POSTERS = {
  'Arokago.mp4': 'images/sample_Arokagomp4.jpg',
  'coco pop.mp4': 'images/sample_cocopopmp4.jpg',
  'Food.mp4': 'images/sample_Foodmp4.jpg',
  'มหานาค.mp4': 'images/work_mahanak.png',
  'animation.mp4': 'images/sample_animationMP4.jpg',
  'animation.MP4': 'images/sample_animationMP4.jpg',
  'ซับ2.mp4': 'images/sample_Foodmp4.jpg'
};

// Google Drive Master Direct File Links & Embed IDs
const VIDEO_DRIVE_LINKS = {
  'animation.mp4': 'https://drive.google.com/file/d/17i0jwEYNXZrGw-lSxlCR93Vi8j3FoM4y/view?usp=sharing',
  'animation.MP4': 'https://drive.google.com/file/d/17i0jwEYNXZrGw-lSxlCR93Vi8j3FoM4y/view?usp=sharing',
  'Arokago.mp4': 'https://drive.google.com/file/d/1laOhtOfl7q4sdasFSEMPQ8zyP8cM8-GL/view?usp=sharing',
  'coco pop.mp4': 'https://drive.google.com/file/d/1MNf1PU9cVKe8wDkAt4dxd1PlWB-hNiIc/view?usp=sharing',
  'Food.mp4': 'https://drive.google.com/file/d/1pFPw8B64CCK_zFRJpwVj_cpo6a57n-4q/view?usp=sharing',
  'มหานาค.mp4': 'https://drive.google.com/file/d/1RFvMFCkASRqmIdBM4v5Gt5Lly19QQuGj/view?usp=sharing'
};

const VIDEO_DRIVE_IDS = {
  'animation.mp4': '17i0jwEYNXZrGw-lSxlCR93Vi8j3FoM4y',
  'animation.MP4': '17i0jwEYNXZrGw-lSxlCR93Vi8j3FoM4y',
  'Arokago.mp4': '1laOhtOfl7q4sdasFSEMPQ8zyP8cM8-GL',
  'coco pop.mp4': '1MNf1PU9cVKe8wDkAt4dxd1PlWB-hNiIc',
  'Food.mp4': '1pFPw8B64CCK_zFRJpwVj_cpo6a57n-4q',
  'มหานาค.mp4': '1RFvMFCkASRqmIdBM4v5Gt5Lly19QQuGj'
};

// Format bytes to human readable string
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// API: Get all videos with metadata
app.get('/api/videos', (req, res) => {
  try {
    if (!fs.existsSync(VIDEO_DIR)) {
      return res.status(404).json({ error: 'Video directory not found' });
    }

    const files = fs.readdirSync(VIDEO_DIR);
    const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi'];
    const EXCLUDED_FILES = ['รีวิว.mp4', '0913.mp4'];

    const videoList = files
      .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()) && !EXCLUDED_FILES.includes(file.toLowerCase()) && !EXCLUDED_FILES.includes(file))
      .map((file, index) => {
        const filePath = path.join(VIDEO_DIR, file);
        const stats = fs.statSync(filePath);
        const preset = VIDEO_METADATA_PRESETS[file] || VIDEO_METADATA_PRESETS[file.toLowerCase()] || {
          title: path.parse(file).name,
          category: 'other',
          categoryLabel: 'General Video',
          description: 'วิดีโอผลงานคุณภาพสูง สร้างสรรค์ด้วยเทคนิคการตัดต่อและการแต่งภาพอย่างประณีต',
          tools: ['Video Editor', 'Audio Design'],
          highlight: 'High Definition',
          badge: 'Video'
        };

        const poster = VIDEO_POSTERS[file] || VIDEO_POSTERS[file.toLowerCase()] || '';

        return {
          id: index + 1,
          filename: file,
          encodedFilename: encodeURIComponent(file),
          streamUrl: `/api/stream/${encodeURIComponent(file)}`,
          driveUrl: VIDEO_DRIVE_LINKS[file] || VIDEO_DRIVE_LINKS[file.toLowerCase()] || 'https://drive.google.com/drive/folders/1rJUM3uc0SRMwIr89VknVdLfFYmTWIoGj?usp=sharing',
          driveId: VIDEO_DRIVE_IDS[file] || VIDEO_DRIVE_IDS[file.toLowerCase()] || '',
          poster: poster,
          title: preset.title,
          category: preset.category,
          categoryLabel: preset.categoryLabel,
          description: preset.description,
          tools: preset.tools,
          highlight: preset.highlight,
          badge: preset.badge,
          sizeBytes: stats.size,
          sizeFormatted: formatBytes(stats.size),
          lastModified: stats.mtime
        };
      });

    res.json({
      success: true,
      count: videoList.length,
      videos: videoList
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to retrieve video catalog' });
  }
});

// API: Stream video with HTTP Range Requests (Supports seeking in huge 1.1GB+ files)
app.get('/api/stream/:filename', (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const decodedFilename = decodeURIComponent(rawFilename);
    const safePath = path.normalize(path.join(VIDEO_DIR, decodedFilename));

    // Security check: ensure path is within VIDEO_DIR
    if (!safePath.startsWith(VIDEO_DIR) || !fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const stat = fs.statSync(safePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse Range header e.g. "bytes=32324-"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(safePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache'
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(safePath).pipe(res);
    }
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).send('Streaming error');
  }
});

// Serve static frontend files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to download the full PDF portfolio
app.get('/download/portfolio', (req, res) => {
  const pdfPath = path.join(__dirname, 'public', 'Portfolio_TH.pdf');
  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, 'Portfolio_Chatdanai_Sattayakun.pdf');
  } else {
    res.status(404).send('Portfolio PDF not found');
  }
});

// Endpoint to download resume
app.get('/download/resume', (req, res) => {
  const pdfPath = path.join(__dirname, 'public', 'Resume_TH.pdf');
  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, 'Resume_Chatdanai_Sattayakun.pdf');
  } else {
    res.status(404).send('Resume PDF not found');
  }
});

// 3D Book Experience page
app.get('/book', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// Fallback to index.html for single-page routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎬 Video Portfolio Server is running!`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log(`📁 Video Source: ${VIDEO_DIR}`);
  console.log(`====================================================`);
});
