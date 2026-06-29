import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';
import api from '@/api/axios';

export default function HeritageScreen() {
  const [sites,   setSites]   = useState<any[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [selected,setSelected]= useState<any>(null);
  const [aiInfo,  setAiInfo]  = useState('');
  const [aiLoad,  setAiLoad]  = useState(false);

  useEffect(() => {
    api.get('/heritage').then(r => setSites(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = sites.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  );

  async function learnMore(site: any) {
    setSelected(site);
    setAiInfo('');
    setAiLoad(true);
    try {
      const { data } = await api.post('/ai/chat', {
        message: `Tell me about ${site.name} in Nepal — its history, cultural significance, best time to visit, and travel tips.`,
        history: [],
      });
      setAiInfo(data.reply || data.message || '');
    } catch { setAiInfo('Could not load information.'); }
    finally { setAiLoad(false); }
  }

  if (selected) return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => { setSelected(null); setAiInfo(''); }} style={s.back}>
          <Ionicons name="arrow-back" size={20} color={Brand.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{selected.name}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={s.siteCard}>
          <View style={s.siteIcon}><Text style={{ fontSize: 32 }}>🏛️</Text></View>
          <Text style={s.siteName}>{selected.name}</Text>
          <Text style={s.siteLoc}><Ionicons name="location" size={13} color={Brand.primary} /> {selected.location}</Text>
          {selected.description ? <Text style={s.siteDesc}>{selected.description}</Text> : null}
        </View>
        <Text style={s.aiTitle}>AI Guide 🤖</Text>
        {aiLoad
          ? <ActivityIndicator color={Brand.primary} style={{ marginTop: 20 }} />
          : <Text style={s.aiText}>{aiInfo}</Text>
        }
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Heritage Explorer</Text>
        <Text style={s.sub}>Discover Nepal's cultural treasures</Text>

        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={Brand.textLight} />
          <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
            placeholder="Search sites..." placeholderTextColor={Brand.textLight} />
        </View>

        {loading
          ? <ActivityIndicator color={Brand.primary} style={{ marginTop: 40 }} />
          : filtered.length === 0
            ? <Text style={s.empty}>No heritage sites found. Connect backend to load.</Text>
            : filtered.map((site, i) => (
                <TouchableOpacity key={i} style={s.card} onPress={() => learnMore(site)} activeOpacity={0.8}>
                  <View style={s.cardIcon}><Text style={{ fontSize: 24 }}>🏛️</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{site.name}</Text>
                    <Text style={s.cardLoc}><Ionicons name="location" size={12} color={Brand.primary} /> {site.location || site.district}</Text>
                    {site.description ? <Text style={s.cardDesc} numberOfLines={2}>{site.description}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Brand.textLight} />
                </TouchableOpacity>
              ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Brand.bg },
  scroll:     { padding: 20, paddingBottom: 40 },
  header:     { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, backgroundColor: Brand.white, borderBottomWidth: 1, borderBottomColor: Brand.border },
  back:       { padding: 4 },
  headerTitle:{ fontSize: 17, fontWeight: '700', color: Brand.text, flex: 1 },
  title:      { fontSize: 28, fontWeight: '800', color: Brand.text, marginBottom: 4 },
  sub:        { fontSize: 13, color: Brand.textMuted, marginBottom: 20 },
  searchBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.white, borderWidth: 1.5, borderColor: Brand.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginBottom: 16 },
  searchInput:{ flex: 1, fontSize: 14, color: Brand.text },
  empty