import React, { useState, createContext, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Types
type Product = { id: string; name: string; category: string; price: number; minQty: number };
type CartItem = Product & { qty: number };

// Products Data - VAYU CBD wholesale catalog
const PRODUCTS: Product[] = [
  { id: '1', name: 'Donnie Burger THCA Flower', category: 'Flower', price: 150, minQty: 10 },
  { id: '2', name: 'GMO THCA Flower', category: 'Flower', price: 145, minQty: 10 },
  { id: '3', name: 'Alien Zours THCA Flower', category: 'Flower', price: 155, minQty: 10 },
  { id: '4', name: 'Purple Poison THCA Flower', category: 'Flower', price: 150, minQty: 10 },
  { id: '5', name: 'Lemon Gelato THCA Flower', category: 'Flower', price: 148, minQty: 10 },
  { id: '6', name: 'Blackberry Pre-Roll 1g', category: 'Pre-Rolls', price: 8, minQty: 50 },
  { id: '7', name: 'Tahoe OG Pre-Roll 1g', category: 'Pre-Rolls', price: 8, minQty: 50 },
  { id: '8', name: 'Beignets Pre-Roll 1g', category: 'Pre-Rolls', price: 8, minQty: 50 },
  { id: '9', name: 'Governmint Oasis Pre-Roll 1g', category: 'Pre-Rolls', price: 8, minQty: 50 },
  { id: '10', name: 'Live Rosin Disposable Vape', category: 'Vapes', price: 22, minQty: 25 },
  { id: '11', name: 'Diamond Sauce Disposable', category: 'Vapes', price: 20, minQty: 25 },
  { id: '12', name: 'Cold Cured Live Rosin 1g', category: 'Concentrates', price: 35, minQty: 20 },
  { id: '13', name: 'Delta 8 Gummies 500mg', category: 'Gummies', price: 12, minQty: 50 },
  { id: '14', name: 'Delta 9 Gummies 300mg', category: 'Gummies', price: 15, minQty: 50 },
];

// Context
const CartContext = createContext<{
  cart: CartItem[];
  addToCart: (p: Product, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}>({ cart: [], addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {} });

// Screens
const ProductsScreen = () => {
  const { addToCart } = useContext(CartContext);
  const [filter, setFilter] = useState('All');
  const [qty, setQty] = useState<Record<string, string>>({});

  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];
  const filtered = filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const handleAdd = (p: Product) => {
    const q = parseInt(qty[p.id] || '0');
    if (q < p.minQty) return Alert.alert('Min Order', `Minimum ${p.minQty} units required`);
    addToCart(p, q);
    setQty({ ...qty, [p.id]: '' });
    Alert.alert('Added', `${q}x ${p.name} added to cart`);
  };

  return (
    <View style={s.container}>
      <Text style={s.header}>VAYU Wholesale</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
        {categories.map(c => (
          <TouchableOpacity key={c} onPress={() => setFilter(c)}
            style={[s.filterBtn, filter === c && s.filterActive]}>
            <Text style={[s.filterTxt, filter === c && s.filterTxtActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList data={filtered} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>{item.name}</Text>
            <Text style={s.cardCat}>{item.category}</Text>
          </View>
          <Text style={s.price}>${item.price}/unit • Min: {item.minQty}</Text>
          <View style={s.cardRow}>
            <TextInput style={s.input} placeholder="Qty" keyboardType="numeric"
              value={qty[item.id] || ''} onChangeText={t => setQty({ ...qty, [item.id]: t })} />
            <TouchableOpacity style={s.addBtn} onPress={() => handleAdd(item)}>
              <Text style={s.addBtnTxt}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      )} />
    </View>
  );
};

const CartScreen = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [info, setInfo] = useState({ name: '', email: '', phone: '', business: '', notes: '' });

  const submitOrder = () => {
    if (!info.name || !info.email || !info.business)
      return Alert.alert('Required', 'Please fill name, email, and business name');
    if (!cart.length) return Alert.alert('Empty Cart', 'Add products first');
    Alert.alert('Order Submitted',
      `Thank you ${info.name}!\n\nOrder Total: $${total.toLocaleString()}\nWe'll contact you at ${info.email} to confirm.`,
      [{ text: 'OK', onPress: clearCart }]
    );
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Cart & Order</Text>
      {cart.length === 0 ? <Text style={s.empty}>Cart is empty</Text> : (
        <>
          {cart.map(i => (
            <View key={i.id} style={s.cartItem}>
              <View>
                <Text style={s.cartName}>{i.name}</Text>
                <Text style={s.cartQty}>{i.qty} × ${i.price} = ${(i.qty * i.price).toLocaleString()}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(i.id)}>
                <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ))}
          <Text style={s.total}>Total: ${total.toLocaleString()}</Text>
        </>
      )}
      <Text style={s.section}>Business Information</Text>
      <TextInput style={s.formInput} placeholder="Contact Name *" value={info.name}
        onChangeText={t => setInfo({ ...info, name: t })} />
      <TextInput style={s.formInput} placeholder="Email *" keyboardType="email-address"
        value={info.email} onChangeText={t => setInfo({ ...info, email: t })} />
      <TextInput style={s.formInput} placeholder="Phone" keyboardType="phone-pad"
        value={info.phone} onChangeText={t => setInfo({ ...info, phone: t })} />
      <TextInput style={s.formInput} placeholder="Business Name *" value={info.business}
        onChangeText={t => setInfo({ ...info, business: t })} />
      <TextInput style={[s.formInput, s.notes]} placeholder="Order Notes" multiline
        value={info.notes} onChangeText={t => setInfo({ ...info, notes: t })} />
      <TouchableOpacity style={s.submitBtn} onPress={submitOrder}>
        <Text style={s.submitTxt}>Submit Wholesale Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const AccountScreen = () => (
  <ScrollView style={s.container}>
    <Text style={s.header}>Account</Text>
    <View style={s.infoBox}>
      <Text style={s.infoTitle}>VAYU CBD</Text>
      <Text style={s.infoTxt}>Premium THCA & Delta 8 Products</Text>
      <Text style={s.infoTxt}>San Diego, California</Text>
      <Text style={s.infoLink}>www.vayucbd.com</Text>
    </View>
    <View style={s.infoBox}>
      <Text style={s.infoTitle}>Wholesale Benefits</Text>
      <Text style={s.infoTxt}>• Competitive wholesale pricing</Text>
      <Text style={s.infoTxt}>• Lab-tested, compliant products</Text>
      <Text style={s.infoTxt}>• 100% USA grown hemp</Text>
      <Text style={s.infoTxt}>• Dedicated account support</Text>
    </View>
    <View style={s.infoBox}>
      <Text style={s.infoTitle}>Contact</Text>
      <Text style={s.infoTxt}>Email: support@vayucbd.com</Text>
      <Text style={s.infoTxt}>For orders and inquiries</Text>
    </View>
  </ScrollView>
);

// Navigation
const Tab = createBottomTabNavigator();

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (p: Product, qty: number) => {
    setCart(c => {
      const existing = c.find(i => i.id === p.id);
      return existing
        ? c.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i)
        : [...c, { ...p, qty }];
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart: id => setCart(c => c.filter(i => i.id !== id)), clearCart: () => setCart([]) }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#2d2d44' },
          tabBarActiveTintColor: '#4ecca3',
          tabBarInactiveTintColor: '#888',
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = { Products: 'leaf', Cart: 'cart', Account: 'person' };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          }
        })}>
          <Tab.Screen name="Products" component={ProductsScreen} />
          <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarBadge: cart.length || undefined }} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </CartContext.Provider>
  );
}

// Styles
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 16, paddingTop: 50 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#4ecca3', marginBottom: 16 },
  filterRow: { maxHeight: 50, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2d2d44', marginRight: 8 },
  filterActive: { backgroundColor: '#4ecca3' },
  filterTxt: { color: '#aaa', fontWeight: '600' },
  filterTxtActive: { color: '#1a1a2e' },
  card: { backgroundColor: '#2d2d44', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },
  cardCat: { fontSize: 12, color: '#4ecca3', backgroundColor: '#1a1a2e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  price: { color: '#aaa', marginVertical: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff' },
  addBtn: { backgroundColor: '#4ecca3', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  addBtnTxt: { color: '#1a1a2e', fontWeight: 'bold' },
  empty: { color: '#888', textAlign: 'center', marginVertical: 40 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2d2d44', padding: 16, borderRadius: 12, marginBottom: 8 },
  cartName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cartQty: { color: '#aaa', marginTop: 4 },
  total: { fontSize: 20, fontWeight: 'bold', color: '#4ecca3', textAlign: 'right', marginVertical: 16 },
  section: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 24, marginBottom: 12 },
  formInput: { backgroundColor: '#2d2d44', borderRadius: 8, padding: 14, color: '#fff', marginBottom: 12 },
  notes: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#4ecca3', padding: 16, borderRadius: 12, marginTop: 8, marginBottom: 40 },
  submitTxt: { color: '#1a1a2e', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  infoBox: { backgroundColor: '#2d2d44', borderRadius: 12, padding: 16, marginBottom: 12 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#4ecca3', marginBottom: 8 },
  infoTxt: { color: '#ccc', marginBottom: 4 },
  infoLink: { color: '#4ecca3', marginTop: 8 },
});
