import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';
import api from '@/api/axios';

export default function PlannerScreen() {
  const [destination, setDestination] = useState('');
  const [days,        setDays]        = useState('');
  const [fitness,     setFitness]     = useState('moderate');
  const [budget,      setBudget]      = useState('mid-range');
  const [plan,        setPlan]        = useState('');
  const [loading,     setLoading]     = useState(false);

  const fitnessOpts = ['easy', 'moderate', 'challenging'];
  const budgetOpts  = ['budget', 'mid-range', 'luxury'];

  async function generatePlan() {
    if (!destination || !days) return;
    setLoading(true);
    setPlan('');
    try {
      const prompt = `Create a ${days}-day trek/travel plan for ${destination}, Nepal. Fitness level: ${fitness}. Budget: ${budget}. Include: daily itinerary, accommodation (teahouses/hotels), permits needed, packing tips, and emergency contacts.`;
      const { data } = await api.post('/ai/chat', { message: prompt, history: [] });
      setPlan(data.reply || data.message || '');
    } catch {
      setPlan('⚠️ Could not generate plan. Check your connection.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Trek Planner</Text>
        <Text style={s.sub}>Custom itineraries powered by AI</Text>

        <Text style={s.label}>Destination</Text>
        <TextInput style={s.input} value={destination} onChangeText={setDestination}
          placeholder="e.g. Everest Base Camp, Annapurna Circuit..."
          placeholderTextColor={Brand.textLight} />

        <Text style={s.label}>Number of Days</Text>
        <TextInput style={s.input} value={days} onChangeText={setDays}
          placeholder="e.g. 14" keyboardType="numeric"
          placeholderTextColor={Brand.textLight} />

        <Text style={s.label}>Fitness Level</Text>
        <View style={s.optRow}>
          {fitnessOpts.map(o => (
            <TouchableOpacity key={o} style={[s.opt, fitness === o && s.optActive]} onPress={() => setFitness(o)}>
              <Text style={[s.optText, fitness === o && s.optTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Budget</Text>
        <View style={s.optRow}>
          {budgetOpts.map(o => (
            <TouchableOpacity key={o} style={[s.opt, budget === o && s.optActive]} onPress={() => setBudget(o)}>
              <Text style={[s.optText, budget === o && s.optTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.btn, (!destination || !days || loading) && { opacity: 0.6 }]}
          onPress={generatePlan} disabled={!destination || !days || loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="map" size={16} color="#fff" /><Text style={s.btnText}>  Generate Plan</Text></>
          }
        </TouchableOpacity>

        {plan ? (
          <View style={s.planCard}>
            <Text style={s.planTitle}>Your Itinerary 🏔️</Text>
            <Text style={s.planText}>{plan}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Brand.bg },
  scroll:       { padding: 20, paddingBottom: 40 },
  title:        { fontSize: 28, fontWeight: '800', color: Brand.text, marginBottom: 4 },
  sub:          { fontSize: 13, color: Brand.textMuted, marginBottom: 24 },
  label:        { fontSize: 13, fontWeight: '600', color: Brand.text, marginBottom: 8 },
  input:        { backgroundColor: Brand.white, borderWidth: 1.5, borderColor: Brand.border, borderRadius: 12, padding: 14, fontSize: 14, color: Brand.text, marginBottom: 16 },
  optRow:       { flexDirection: 'row', gap: 8, marginBottom: 16 },
  opt:          { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Brand.border, alignItems: 'center', backgroundColor: Brand.white },
  optActive:    { borderColor: Brand.primary, backgroundColor: 'rgba(249,115,22,0.08)' },
  optText:      { fontSize: 12, fontWeight: '600', color: Brand.textMuted, textTransform: 'capitalize' },
  optTextActive:{ color: Brand.primary },
  btn:          { backgroundColor: Brand.primary, borderRadius: 999, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 8, elevation: 4, marginBottom: 20 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  planCard:     { backgroundColor: Brand.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Brand.border },
  planTitle:    { fontSize: 18, fontWeight: '800', color: Brand.text, marginBottom: 12 },
  planText:     { fontSize: 13, color: Brand.textMuted, lineHeight: 22 },
});