import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from '../models/Place.js';

dotenv.config();

const places = [
  { name: 'Everest Base Camp', description: 'The base camp for Mount Everest, the world highest peak at 8849m.', district: 'Solukhumbu', region: 'Koshi', lat: 28.0026, lng: 86.8528, category: 'tourist', bestTime: 'March-May, Sep-Nov' },
  { name: 'Annapurna Base Camp', description: 'Stunning mountain sanctuary surrounded by Himalayan peaks.', district: 'Kaski', region: 'Gandaki', lat: 28.5300, lng: 83.8778, category: 'tourist', bestTime: 'March-May, Sep-Nov' },
  { name: 'Pokhara', description: 'The gateway to the Annapurna region with beautiful lakeside views.', district: 'Kaski', region: 'Gandaki', lat: 28.2096, lng: 83.9856, category: 'tourist', bestTime: 'Oct-Dec, Mar-May' },
  { name: 'Chitwan National Park', description: 'UNESCO World Heritage Site famous for rhinos and Bengal tigers.', district: 'Chitwan', region: 'Bagmati', lat: 27.5291, lng: 84.3542, category: 'tourist', bestTime: 'Oct-Mar' },
  { name: 'Langtang Valley', description: 'A beautiful trekking destination close to Kathmandu.', district: 'Rasuwa', region: 'Bagmati', lat: 28.2140, lng: 85.5140, category: 'tourist', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Upper Mustang', description: 'Ancient Himalayan kingdom with dramatic desert landscapes.', district: 'Mustang', region: 'Gandaki', lat: 29.1800, lng: 83.9700, category: 'tourist', bestTime: 'Mar-Nov' },
  { name: 'Rara Lake', description: 'Nepal largest lake, pristine and remote in the far west.', district: 'Mugu', region: 'Karnali', lat: 29.5286, lng: 82.0875, category: 'tourist', bestTime: 'Apr-Jun, Sep-Nov' },
  { name: 'Lumbini', description: 'Birthplace of Lord Buddha and UNESCO World Heritage Site.', district: 'Rupandehi', region: 'Lumbini', lat: 27.4833, lng: 83.2833, category: 'tourist', bestTime: 'Oct-Mar' },
  { name: 'Phewa Lake', description: 'Second largest lake in Nepal with Annapurna reflections.', district: 'Kaski', region: 'Gandaki', lat: 28.2083, lng: 83.9597, category: 'tourist', bestTime: 'Oct-Apr' },
  { name: 'Manang', description: 'High altitude village on the Annapurna Circuit at 3500m.', district: 'Manang', region: 'Gandaki', lat: 28.6667, lng: 84.0167, category: 'tourist', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Bandipur', description: 'Hilltop town preserving traditional Newari architecture.', district: 'Tanahun', region: 'Gandaki', lat: 27.9333, lng: 84.4167, category: 'tourist', bestTime: 'Oct-Apr' },
  { name: 'Ilam', description: 'Famous for tea gardens and scenic eastern hills.', district: 'Ilam', region: 'Koshi', lat: 26.9122, lng: 87.9258, category: 'tourist', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Gosainkunda', description: 'Sacred alpine lake at 4380m, pilgrimage site for Hindus.', district: 'Rasuwa', region: 'Bagmati', lat: 28.1500, lng: 85.4167, category: 'tourist', bestTime: 'May-Jun, Aug-Sep' },
  { name: 'Namche Bazaar', description: 'The gateway and trading hub of the Everest region at 3440m.', district: 'Solukhumbu', region: 'Koshi', lat: 27.8069, lng: 86.7142, category: 'tourist', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Tilicho Lake', description: 'One of the highest lakes in the world at 4919m.', district: 'Manang', region: 'Gandaki', lat: 28.6833, lng: 83.8500, category: 'tourist', bestTime: 'Apr-May, Sep-Oct' },
  { name: 'Pashupatinath Temple', description: 'Most sacred Hindu temple in Nepal on the banks of the Bagmati river.', district: 'Kathmandu', region: 'Bagmati', lat: 27.7105, lng: 85.3487, category: 'heritage', significance: 'Sacred Hindu temple, UNESCO World Heritage Site', bestTime: 'Oct-Mar' },
  { name: 'Boudhanath Stupa', description: 'One of the largest stupas in the world, center of Tibetan Buddhism in Nepal.', district: 'Kathmandu', region: 'Bagmati', lat: 27.7215, lng: 85.3620, category: 'heritage', significance: 'UNESCO World Heritage Site, Tibetan Buddhist center', bestTime: 'Oct-Mar' },
  { name: 'Swayambhunath', description: 'Ancient religious complex atop a hill, also known as the Monkey Temple.', district: 'Kathmandu', region: 'Bagmati', lat: 27.7149, lng: 85.2904, category: 'heritage', significance: 'UNESCO World Heritage Site, 2500 years old', bestTime: 'Oct-Mar' },
  { name: 'Kathmandu Durbar Square', description: 'Ancient royal palace complex in the heart of Kathmandu.', district: 'Kathmandu', region: 'Bagmati', lat: 27.7044, lng: 85.3067, category: 'heritage', significance: 'UNESCO World Heritage Site, Malla dynasty palace', bestTime: 'Oct-Mar' },
  { name: 'Patan Durbar Square', description: 'Beautiful medieval palace with fine Newari architecture.', district: 'Lalitpur', region: 'Bagmati', lat: 27.6726, lng: 85.3251, category: 'heritage', significance: 'UNESCO World Heritage Site, finest Newari architecture', bestTime: 'Oct-Mar' },
  { name: 'Bhaktapur Durbar Square', description: 'Best preserved medieval city in the Kathmandu Valley.', district: 'Bhaktapur', region: 'Bagmati', lat: 27.6722, lng: 85.4278, category: 'heritage', significance: 'UNESCO World Heritage Site, medieval city', bestTime: 'Oct-Mar' },
  { name: 'Changu Narayan', description: 'Oldest Hindu temple in the Kathmandu Valley dating to 4th century.', district: 'Bhaktapur', region: 'Bagmati', lat: 27.7133, lng: 85.4550, category: 'heritage', significance: 'UNESCO World Heritage Site, oldest temple in valley', bestTime: 'Oct-Mar' },
  { name: 'Sagarmatha National Park', description: 'Home to Mount Everest and diverse Himalayan wildlife.', district: 'Solukhumbu', region: 'Koshi', lat: 27.9500, lng: 86.9167, category: 'heritage', significance: 'UNESCO World Heritage Site, Everest region', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Lumbini Sacred Garden', description: 'Exact birthplace of Siddhartha Gautama, the Buddha.', district: 'Rupandehi', region: 'Lumbini', lat: 27.4833, lng: 83.2833, category: 'heritage', significance: 'UNESCO World Heritage Site, birthplace of Buddha', bestTime: 'Oct-Mar' },
  { name: 'Chitwan National Park Heritage', description: 'First national park of Nepal with rare one-horned rhinos.', district: 'Chitwan', region: 'Bagmati', lat: 27.5291, lng: 84.3542, category: 'heritage', significance: 'UNESCO World Heritage Site, wildlife conservation', bestTime: 'Oct-Mar' },
  { name: 'Everest Base Camp Trek', description: 'Classic trek to the base of the world highest mountain.', district: 'Solukhumbu', region: 'Koshi', lat: 28.0026, lng: 86.8528, category: 'trail', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Annapurna Circuit', description: 'One of the world greatest treks circumnavigating the Annapurna massif.', district: 'Kaski', region: 'Gandaki', lat: 28.5300, lng: 83.8778, category: 'trail', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Langtang Trek', description: 'Accessible trekking close to Kathmandu through Langtang Valley.', district: 'Rasuwa', region: 'Bagmati', lat: 28.2140, lng: 85.5140, category: 'trail', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Manaslu Circuit', description: 'Remote trek around the eighth highest mountain in the world.', district: 'Gorkha', region: 'Gandaki', lat: 28.5500, lng: 84.5592, category: 'trail', bestTime: 'Mar-May, Sep-Nov' },
  { name: 'Upper Mustang Trek', description: 'Restricted area trek through the ancient kingdom of Lo.', district: 'Mustang', region: 'Gandaki', lat: 29.1800, lng: 83.9700, category: 'trail', bestTime: 'Mar-Nov' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    await Place.deleteMany({});
    await Place.insertMany(places);
    console.log(`Seeded ${places.length} places successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();