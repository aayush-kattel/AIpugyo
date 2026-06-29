import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const difficulties  = ['Easy', 'Moderate', 'Hard', 'Extreme'];
const destinations  = [
  { name: 'Everest Base Camp',  img: 'https://excitingnepal.com/wp-content/uploads/2021/12/12-Days-Everest-base-Camp-trek.jpeg' },
  { name: 'Annapurna Circuit',  img: 'https://www.muchbetteradventures.com/magazine/content/images/2025/10/Annapurna-Circuit-6-1600x1067--1-.jpeg' },
  { name: 'Langtang Valley',    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxJCdZy9C6xxd_kgFGzpTasC-9uCaCn4tghFePbew5Zw&s=10' },
  { name: 'Upper Mustang',      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu6w7Kd4MmEn6UWoWVYLiWWI8172thIIMXkRmLdPPSmg&s=10' },
  { name: 'Manaslu Circuit',    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQUSx6ZCcziJ6JKr_fxIeaa-gorLa6sGqwbr9CbUTyBw&s=10' },
  { name: 'Gokyo Lakes',        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgfrhCGajrL9B4YKuFwvNjb_GRZYTwiop54_6iDg8s1g&s=10' },
  { name: 'Poon Hill',          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1mfvx_MVBWnVuuq078Pt0UG7Blc4NaGiFoJSAksfvIA&s=10' },
  { name: 'Kanchenjunga',       img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQeoIyuMOnyypSoxUBJaRRJ40kGXM4soo-1gwYKl6Ijw&s=10' },
  { name: 'Dolpo',              img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQQEf0ksjmZ-OhRlBNadF2YJpkV52eGw0dvHJQGxqBTQ&s=10' },
  { name: 'Kathmandu Valley',   img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ_Nkkgc_05LA-ihupeOzPVHBBtvyNoo4sEOvk-OAFuA&s=10' },
];

export default function Planner() {
  const [step,      setStep]      = useState(1);
  const [form,      setForm]      = useState({ destination: '', days: 7, difficulty: 'Moderate', budget: 50 });
  const [itinerary, setItinerary] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [planCount, setPlanCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').trekPlans || 0; } catch { return 0; }
  });

  async function generate() {
    if (!form.destination) { toast.error('Please choose a destination'); return; }
    setLoading(true);
    setItinerary(null);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { data } = await api.post('/ai/itinerary', { ...form, userId: user._id });
      setItinerary(data.itinerary);
      setStep(3);

      // Increment count and sync to localStorage immediately
      const newCount = planCount + 1;
      setPlanCount(newCount);
      const fresh = { ...user, trekPlans: newCount };
      localStorage.setItem('user', JSON.stringify(fresh));
    } catch {
      toast.error('Could not generate itinerary — check backend connection');
    } finally {
      setLoading(false);
    }
  }

  const selectedDest = destinations.find(d => d.name === form.destination);

  return (
    <div style={{ background: '#fff8f4', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      <Navbar />
      <main className="flex flex-col items-center py-16 px-6">

        {/* Header */}
        <div className="max-w-3xl w-full text-center mb-12">
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#1f1b17', lineHeight: '48px' }}>
            Craft Your Himalayan Journey
          </h1>
          <p className="mt-3 text-lg" style={{ color: '#584237' }}>
            Tell AI Pugyo about your dream trek, and we'll handle the logistics, trails, and cultural stops.
          </p>
          {planCount > 0 && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: '#ffdbca', color: '#9d4300' }}>
              <span className="material-symbols-outlined text-[16px]">map</span>
              {planCount} Trek Plan{planCount !== 1 ? 's' : ''} Generated
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="max-w-3xl w-full mb-10">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 h-0.5 top-5" style={{ background: '#e0d9cc', zIndex: 0 }}></div>
            {['Destination', 'Preferences', 'Your Plan'].map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2"
                  style={{
                    background:  step > i     ? '#9d4300' : '#fff',
                    borderColor: step >= i+1  ? '#9d4300' : '#e0d9cc',
                    color:       step > i     ? '#fff'    : step === i+1 ? '#9d4300' : '#8c7164',
                  }}>
                  {step > i ? <span className="material-symbols-outlined text-[18px]">check</span> : i + 1}
                </div>
                <span className="text-xs font-semibold"
                  style={{ color: step === i + 1 ? '#9d4300' : '#8c7164' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl w-full">

          {/* Step 1 — Destination */}
          {step === 1 && (
            <div className="p-8 rounded-2xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
              <h2 className="font-bold text-xl mb-6" style={{ color: '#1f1b17' }}>Where do you want to trek?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destinations.map(d => (
                  <button key={d.name} onClick={() => setForm({ ...form, destination: d.name })}
                    className="rounded-xl border text-left text-sm font-semibold transition-all hover:shadow-sm overflow-hidden flex items-center"
                    style={{
                      borderColor: form.destination === d.name ? '#f97316' : '#e0d9cc',
                      background:  form.destination === d.name ? '#fff8f4' : '#fff',
                      color:       form.destination === d.name ? '#9d4300' : '#1f1b17',
                      padding: 0,
                    }}>
                    <div style={{ width: 72, height: 60, flexShrink: 0, overflow: 'hidden' }}>
                      <img src={d.img} alt={d.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80'; }} />
                    </div>
                    <div className="flex items-center gap-2 px-4 flex-1">
                      <span className="material-symbols-outlined text-[18px]"
                        style={{ color: form.destination === d.name ? '#f97316' : '#8c7164', fontVariationSettings: "'FILL' 1" }}>
                        landscape
                      </span>
                      {d.name}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (!form.destination) { toast.error('Pick a destination'); return; } setStep(2); }}
                className="mt-8 px-8 py-3 rounded-full text-white font-semibold flex items-center gap-2 transition-all hover:brightness-95"
                style={{ background: '#f97316' }}>
                Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2 — Preferences */}
          {step === 2 && (
            <div className="p-8 rounded-2xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
              {selectedDest && (
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: '#fff8f4', border: '1px solid #e0d9cc' }}>
                  <img src={selectedDest.img} alt={selectedDest.name}
                    style={{ width: 56, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                  <div>
                    <p className="text-xs" style={{ color: '#8c7164' }}>Selected Destination</p>
                    <p className="font-bold" style={{ color: '#9d4300' }}>{selectedDest.name}</p>
                  </div>
                </div>
              )}
              <h2 className="font-bold text-xl mb-6" style={{ color: '#1f1b17' }}>Set your preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold mb-3" style={{ color: '#1f1b17' }}>
                    Duration: <span style={{ color: '#f97316' }}>{form.days} days</span>
                  </label>
                  <input type="range" min={3} max={21} value={form.days}
                    onChange={e => setForm({ ...form, days: +e.target.value })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#f97316' }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#8c7164' }}>
                    <span>3 days</span><span>21 days</span>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-3" style={{ color: '#1f1b17' }}>Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map(d => (
                      <button key={d} onClick={() => setForm({ ...form, difficulty: d })}
                        className="px-5 py-2 rounded-full text-sm font-semibold border transition-all"
                        style={{
                          background:  form.difficulty === d ? '#9d4300' : '#fff',
                          color:       form.difficulty === d ? '#fff'    : '#584237',
                          borderColor: form.difficulty === d ? '#9d4300' : '#e0d9cc',
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-3" style={{ color: '#1f1b17' }}>
                    Budget: <span style={{ color: '#f97316' }}>${form.budget}/day</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, budget: Math.max(20, f.budget - 5) }))}
                      className="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-lg transition-all hover:bg-gray-50"
                      style={{ borderColor: '#e0d9cc', color: '#9d4300', flexShrink: 0 }}>−</button>
                    <input type="range" min={20} max={200} step={5} value={form.budget}
                      onChange={e => setForm({ ...form, budget: +e.target.value })}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#f97316' }} />
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, budget: Math.min(200, f.budget + 5) }))}
                      className="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-lg transition-all hover:bg-gray-50"
                      style={{ borderColor: '#e0d9cc', color: '#9d4300', flexShrink: 0 }}>+</button>
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#8c7164' }}>
                    <span>$20</span><span>$200</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:bg-gray-50"
                  style={{ borderColor: '#e0d9cc', color: '#584237' }}>
                  Back
                </button>
                <button onClick={generate} disabled={loading}
                  className="px-8 py-3 rounded-full text-white font-semibold flex items-center gap-2 transition-all hover:brightness-95 disabled:opacity-60"
                  style={{ background: '#f97316' }}>
                  {loading ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Generating...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Generate Plan</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Results */}
          {step === 3 && itinerary && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#ffdbca', color: '#341100' }}>
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Generated
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1f1b17' }}>{form.destination}</h2>
              </div>

              {selectedDest && (
                <div className="mb-6 rounded-2xl overflow-hidden" style={{ height: 200 }}>
                  <img src={selectedDest.img} alt={form.destination}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Summary bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-5 rounded-2xl border"
                style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                {[
                  { icon: 'calendar_month', label: 'Duration',   val: `${form.days} Days` },
                  { icon: 'trending_up',    label: 'Difficulty', val: form.difficulty },
                  { icon: 'payments',       label: 'Budget',     val: `$${form.budget}/day` },
                  { icon: 'map',            label: 'Plans Made', val: planCount },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[20px] mb-1" style={{ color: '#f97316' }}>{icon}</span>
                    <span className="text-xs" style={{ color: '#8c7164' }}>{label}</span>
                    <span className="font-bold text-sm" style={{ color: '#1f1b17' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Day cards */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: '#e0d9cc' }}></div>
                <div className="space-y-6">
                  {Array.isArray(itinerary) && itinerary.map((day, i) => (
                    <div key={i} className="relative pl-16">
                      <div className="absolute left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: '#f97316' }}>
                        {day.day || i + 1}
                      </div>
                      <div className="p-5 rounded-2xl border hover:shadow-sm transition-all"
                        style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#f97316' }}>Day {day.day || i + 1}</span>
                        <h3 className="font-bold text-base mt-0.5 mb-2" style={{ color: '#1f1b17' }}>{day.title}</h3>
                        <p className="text-sm mb-3" style={{ color: '#584237' }}>{day.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#8c7164' }}>
                          {day.distance_km    && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" style={{ color: '#f97316' }}>straighten</span>{day.distance_km} km</span>}
                          {day.max_altitude_m && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" style={{ color: '#f97316' }}>landscape</span>{day.max_altitude_m}m</span>}
                          {day.accommodation  && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" style={{ color: '#f97316' }}>hotel</span>{day.accommodation}</span>}
                        </div>
                        {day.safety_tip && (
                          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl"
                            style={{ background: '#fff8f4', border: '1px solid #ffdbca' }}>
                            <span className="material-symbols-outlined text-[14px] mt-0.5" style={{ color: '#f97316' }}>warning</span>
                            <p className="text-xs" style={{ color: '#584237' }}>{day.safety_tip}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setStep(1); setItinerary(null); setForm({ destination: '', days: 7, difficulty: 'Moderate', budget: 50 }); }}
                className="mt-8 px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:bg-gray-50"
                style={{ borderColor: '#e0d9cc', color: '#584237' }}>
                Plan Another Trek
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}