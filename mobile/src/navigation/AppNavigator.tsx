import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderActions } from '../components/HeaderActions';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NewsDetailScreen } from '../screens/NewsDetailScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { AppTabsParamList, CategoriesStackParamList, HomeStackParamList } from './types';

const Tab = createBottomTabNavigator<AppTabsParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();

function HomeStackNavigator() {
  const { colors } = useTheme();

  return (
    <HomeStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => <HeaderActions />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <HomeStack.Screen component={HomeScreen} name="HomeList" options={{ title: 'Noticias' }} />
      <HomeStack.Screen component={NewsDetailScreen} name="NewsDetail" options={{ title: 'Detalle' }} />
    </HomeStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  const { colors } = useTheme();

  return (
    <CategoriesStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => <HeaderActions />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <CategoriesStack.Screen component={CategoriesScreen} name="CategoriesList" options={{ title: 'Categorias' }} />
    </CategoriesStack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const name = route.name === 'HomeTab' ? 'newspaper' : 'albums';

          return <Ionicons color={color} name={name} size={size} />;
        },
      })}
    >
      <Tab.Screen component={HomeStackNavigator} name="HomeTab" options={{ title: 'Inicio' }} />
      <Tab.Screen component={CategoriesStackNavigator} name="CategoriesTab" options={{ title: 'Categorias' }} />
    </Tab.Navigator>
  );
}
