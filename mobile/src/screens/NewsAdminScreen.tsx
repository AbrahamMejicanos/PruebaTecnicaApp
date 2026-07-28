import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createCategory, fetchCategories } from '../api/categories.service';
import { getApiErrorMessage } from '../api/client';
import { createNews, deleteNews, fetchNews, fetchNewsDetail, updateNews, type NewsPayload } from '../api/news.service';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useAppAlert } from '../hooks/useAppAlert';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';
import type { Category } from '../types/category';
import type { NewsListItem } from '../types/news';
import { canManageCategories, canManageNews } from '../utils/permissions';
import { formatDate } from '../utils/date';

const emptyForm = {
  title: '',
  image_url: '',
  excerpt: '',
  body: '',
  published_at: new Date().toISOString().slice(0, 10),
};

type SelectedImage = {
  mimeType?: string | null;
  name: string;
  uri: string;
};

export function NewsAdminScreen() {
  const { colors } = useTheme();
  const { showAlert, showError } = useAppAlert();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ description: '', name: '' });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const hasAccess = canManageNews(user?.role);
  const canCreateCategories = canManageCategories(user?.role);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  const loadData = useCallback(async () => {
    if (!hasAccess) {
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const [categoryData, newsData] = await Promise.all([fetchCategories(), fetchNews()]);
      setCategories(categoryData);
      setNews(newsData);
      setSelectedCategoryId((current) => current ?? categoryData[0]?.id ?? null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [hasAccess]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        selectedCategoryId &&
          form.title.trim() &&
          form.excerpt.trim() &&
          form.body.trim() &&
          form.published_at.trim() &&
          (selectedImage || form.image_url.trim()),
      ),
    [form, selectedCategoryId, selectedImage],
  );

  async function startEdit(item: NewsListItem) {
    setFeedback(null);

    try {
      const detail = await fetchNewsDetail(item.id);
      setEditingId(detail.id);
      setSelectedCategoryId(detail.category.id);
      setForm({
        title: detail.title,
        image_url: detail.image_url,
        excerpt: detail.excerpt,
        body: detail.body,
        published_at: detail.published_at.slice(0, 10),
      });
      setSelectedImage(null);
    } catch (requestError) {
      showError(getApiErrorMessage(requestError), 'No se pudo abrir la noticia');
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setSelectedCategoryId(categories[0]?.id ?? null);
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showError('Necesitamos permiso para abrir tus imagenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const fallbackName = `noticia-${Date.now()}.jpg`;
    const name = asset.fileName ?? asset.uri.split('/').pop() ?? fallbackName;

    setSelectedImage({
      mimeType: asset.mimeType ?? 'image/jpeg',
      name,
      uri: asset.uri,
    });
  }

  async function handleSave() {
    if (!canSubmit || !selectedCategoryId) {
      showError('Revisa que titulo, categoria, resumen, cuerpo, imagen y fecha esten completos.');
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload: NewsPayload = {
      category_id: selectedCategoryId,
      title: form.title.trim(),
      image: selectedImage ?? undefined,
      image_url: selectedImage ? undefined : form.image_url.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      published_at: `${form.published_at.trim()}T12:00:00.000Z`,
    };

    try {
      await (editingId ? updateNews(editingId, payload) : createNews(payload));
      showAlert('Listo', editingId ? 'La noticia fue actualizada.' : 'La noticia fue creada.', 'success');
      resetForm();
      setNews(await fetchNews());
    } catch (requestError) {
      showError(getApiErrorMessage(requestError), 'No se pudo guardar');
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(item: NewsListItem) {
    Alert.alert('Eliminar noticia', item.title, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => void handleDelete(item.id),
      },
    ]);
  }

  async function handleDelete(id: number) {
    try {
      await deleteNews(id);
      setNews((current) => current.filter((item) => item.id !== id));
      showAlert('Listo', 'La noticia fue eliminada.', 'success');
    } catch (requestError) {
      showError(getApiErrorMessage(requestError), 'No se pudo eliminar');
    }
  }

  async function handleCreateCategory() {
    if (!categoryForm.name.trim()) {
      showError('Escribe el nombre de la categoria.');
      return;
    }

    setIsCreatingCategory(true);

    try {
      const created = await createCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
      });
      const updatedCategories = [...categories, created].sort((a, b) => b.news_count - a.news_count || a.name.localeCompare(b.name));
      setCategories(updatedCategories);
      setSelectedCategoryId(created.id);
      setCategoryForm({ description: '', name: '' });
      showAlert('Categoria creada', 'Ya puedes usarla al crear noticias.', 'success');
    } catch (requestError) {
      showError(getApiErrorMessage(requestError), 'No se pudo crear la categoria');
    } finally {
      setIsCreatingCategory(false);
    }
  }

  if (!hasAccess) {
    return <ErrorState message="No tienes acceso a gestion de noticias." onRetry={() => undefined} />;
  }

  if (isLoading) {
    return <LoadingState label="Cargando gestion..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadData()} />;
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.primary }]}>Gestion</Text>
        <Text style={[styles.heading, { color: colors.text }]}>Noticias</Text>
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>{editingId ? 'Editar noticia' : 'Crear noticia'}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsCategoryMenuOpen(true)}
          style={[styles.selectButton, { borderColor: colors.border }]}
        >
          <View style={styles.selectText}>
            <Text style={[styles.selectLabel, { color: colors.muted }]}>Categoria</Text>
            <Text numberOfLines={1} style={[styles.selectValue, { color: colors.text }]}>
              {selectedCategory?.name ?? 'Seleccionar categoria'}
            </Text>
          </View>
          <Ionicons color={colors.primary} name="chevron-down" size={20} />
        </Pressable>
        {canCreateCategories ? (
          <View style={[styles.categoryCreateBox, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Nueva categoria</Text>
            <TextInput placeholder="Nombre de categoria" placeholderTextColor={colors.muted} value={categoryForm.name} onChangeText={(name) => setCategoryForm((current) => ({ ...current, name }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
            <TextInput placeholder="Descripcion opcional" placeholderTextColor={colors.muted} value={categoryForm.description} onChangeText={(description) => setCategoryForm((current) => ({ ...current, description }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
            <Pressable disabled={isCreatingCategory} onPress={() => void handleCreateCategory()} style={[styles.secondaryFillButton, { backgroundColor: colors.primarySoft, opacity: isCreatingCategory ? 0.7 : 1 }]}>
              <Ionicons color={colors.primary} name="add-circle-outline" size={18} />
              <Text style={[styles.secondaryFillText, { color: colors.primary }]}>{isCreatingCategory ? 'Creando...' : 'Crear categoria'}</Text>
            </Pressable>
          </View>
        ) : null}
        <TextInput placeholder="Titulo" placeholderTextColor={colors.muted} value={form.title} onChangeText={(title) => setForm((current) => ({ ...current, title }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={[styles.imageBox, { borderColor: colors.border }]}>
          {selectedImage || form.image_url ? (
            <Image source={{ uri: selectedImage?.uri ?? form.image_url }} style={styles.imagePreview} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.elevated }]}>
              <Ionicons color={colors.muted} name="image-outline" size={26} />
              <Text style={[styles.imagePlaceholderText, { color: colors.muted }]}>Sin imagen seleccionada</Text>
            </View>
          )}
          <Pressable onPress={() => void pickImage()} style={[styles.secondaryFillButton, { backgroundColor: colors.primarySoft }]}>
            <Ionicons color={colors.primary} name="cloud-upload-outline" size={18} />
            <Text style={[styles.secondaryFillText, { color: colors.primary }]}>
              {selectedImage || form.image_url ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Text>
          </Pressable>
        </View>
        <TextInput placeholder="Fecha YYYY-MM-DD" placeholderTextColor={colors.muted} value={form.published_at} onChangeText={(published_at) => setForm((current) => ({ ...current, published_at }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <TextInput placeholder="Resumen" placeholderTextColor={colors.muted} value={form.excerpt} onChangeText={(excerpt) => setForm((current) => ({ ...current, excerpt }))} multiline style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text }]} />
        <TextInput placeholder="Cuerpo" placeholderTextColor={colors.muted} value={form.body} onChangeText={(body) => setForm((current) => ({ ...current, body }))} multiline style={[styles.input, styles.textareaLarge, { borderColor: colors.border, color: colors.text }]} />
        {feedback ? <Text style={[styles.feedback, { color: feedback.includes('Completa') || feedback.includes('No ') ? colors.danger : colors.primary }]}>{feedback}</Text> : null}
        <View style={styles.actions}>
          <Pressable disabled={isSaving} onPress={() => void handleSave()} style={[styles.primaryButton, { backgroundColor: colors.primaryStrong, opacity: isSaving ? 0.7 : 1 }]}>
            <Ionicons color="#fff" name="save" size={18} />
            <Text style={styles.primaryButtonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
          </Pressable>
          {editingId ? (
            <Pressable onPress={resetForm} style={[styles.secondaryButton, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancelar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {news.map((item) => (
        <View key={item.id} style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowText}>
            <Text style={[styles.rowCategory, { color: colors.primary }]}>{item.category.name}</Text>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.rowDate, { color: colors.muted }]}>Publicado: {formatDate(item.published_at)}</Text>
          </View>
          <View style={styles.rowActions}>
            <Pressable onPress={() => void startEdit(item)} style={[styles.iconAction, { backgroundColor: colors.primarySoft }]}>
              <Ionicons color={colors.primary} name="create-outline" size={19} />
            </Pressable>
            <Pressable onPress={() => confirmDelete(item)} style={[styles.iconAction, { backgroundColor: colors.primarySoft }]}>
              <Ionicons color={colors.danger} name="trash-outline" size={19} />
            </Pressable>
          </View>
        </View>
      ))}
      <Modal animationType="fade" transparent visible={isCategoryMenuOpen}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Seleccionar categoria</Text>
            <ScrollView style={styles.modalList}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    setIsCategoryMenuOpen(false);
                  }}
                  style={[styles.optionRow, { borderColor: colors.border }]}
                >
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{category.name}</Text>
                  <Text style={[styles.optionMeta, { color: colors.muted }]}>
                    {category.news_count} {category.news_count === 1 ? 'noticia' : 'noticias'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setIsCategoryMenuOpen(false)} style={[styles.secondaryButton, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCreateBox: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 9,
    padding: 10,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 28,
  },
  feedback: {
    fontSize: 13,
    lineHeight: 19,
  },
  header: {
    gap: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
  },
  iconAction: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  imageBox: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    padding: 10,
  },
  imagePlaceholder: {
    alignItems: 'center',
    borderRadius: 8,
    gap: 6,
    height: 150,
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  imagePreview: {
    borderRadius: 8,
    height: 170,
    width: '100%',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxHeight: '78%',
    padding: 14,
    width: '100%',
  },
  modalList: {
    maxHeight: 420,
  },
  optionMeta: {
    fontSize: 12,
  },
  optionRow: {
    borderBottomWidth: 1,
    gap: 4,
    paddingVertical: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  rowActions: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryFillButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 42,
  },
  secondaryFillText: {
    fontSize: 13,
    fontWeight: '900',
  },
  selectButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  selectLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  selectText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  selectValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  rowCard: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  rowCategory: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rowDate: {
    fontSize: 12,
  },
  rowText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  textarea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  textareaLarge: {
    minHeight: 118,
    textAlignVertical: 'top',
  },
});
