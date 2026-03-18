<template>
  <div class="package-builder" ref="rootRef">
    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastVisible" class="toast" :class="'toast--' + toastType">
        {{ toastMessage }}
      </div>
    </transition>

    <!-- List View -->
    <div class="list-view">
      <div class="list-header">
        <h1 class="list-header__title">Packages</h1>
        <button class="btn btn--primary" @click="openCreate">Create Package</button>
      </div>

      <div class="filter-bar">
        <input
          class="search-field"
          type="text"
          placeholder="Search packages…"
          :value="searchQuery"
          @input="onSearchInput"
        />
        <select class="filter-select" :value="statusFilter" @change="onStatusChange">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="listLoading" class="table-wrap">
        <div class="loading-center">
          <span class="spinner"></span>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!packages?.length" class="empty-wrap">
        <div class="empty-state">
          <span class="empty-state__icon">📦</span>
          <h2 class="empty-state__heading">No packages yet</h2>
          <p class="empty-state__text">Create your first package to bundle rewards together.</p>
          <button class="btn btn--primary" @click="openCreate">Create Package</button>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th--first">Package</th>
              <th>Items</th>
              <th>Assignments</th>
              <th>Price</th>
              <th>Points</th>
              <th>Status</th>
              <th class="th--last">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pkg in packages"
              :key="pkg?.id"
              class="data-table__row"
              @click="openEdit(pkg?.id)"
            >
              <td>
                <div class="pkg-cell">
                  <img
                    v-if="pkg?.image?.length"
                    :src="pkg.image[0]"
                    class="pkg-cell__thumb"
                    alt=""
                  />
                  <div class="pkg-cell__text">
                    <span class="pkg-cell__name">{{ pkg?.name || 'Untitled' }}</span>
                    <span v-if="pkg?.description" class="pkg-cell__desc">{{ pkg.description }}</span>
                  </div>
                </div>
              </td>
              <td>{{ pkg?.item_count ?? 0 }}</td>
              <td>{{ pkg?.active_assignments ?? 0 }}</td>
              <td>{{ pkg?.price != null ? formatCurrency(pkg.price) : '—' }}</td>
              <td>{{ pkg?.points_price != null ? formatNumber(pkg.points_price) : '—' }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="pkg?.active_status ? 'status-badge--active' : 'status-badge--inactive'"
                >
                  <span class="status-badge__dot"></span>
                  {{ pkg?.active_status ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="td--date">{{ formatDate(pkg?.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sidebar overlay -->
    <transition name="overlay-fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
    </transition>

    <!-- Sidebar panel -->
    <transition name="sidebar-slide">
      <PackageSidebar
        v-if="sidebarOpen"
        :packageData="editingPackage"
        :isNew="isCreatingNew"
        :isSaving="isSaving"
        :availableRewards="availableRewards"
        :loadingRewards="loadingRewards"
        @save="handleSave"
        @cancel="closeSidebar"
        @search-rewards="handleSearchRewards"
      />
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import PackageSidebar from './components/PackageSidebar.vue'
import { useApi } from './useApi.js'

export default {
  components: { PackageSidebar },
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit, expose }) {
    const rootRef = ref(null)

    // API setup
    const api = useApi(
      () => props.content?.supabaseUrl,
      () => props.content?.apiKey,
      () => props.content?.userAccessToken
    )

    // Internal variables
    const { value: selectedPackageId, setValue: setSelectedPackageId } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'selectedPackageId',
        type: 'string',
        defaultValue: '',
      })

    const { value: packageCount, setValue: setPackageCount } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'packageCount',
        type: 'number',
        defaultValue: 0,
      })

    const { value: isLoadingVar, setValue: setIsLoadingVar } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'isLoading',
        type: 'boolean',
        defaultValue: false,
      })

    // State
    const packages = ref([])
    const listLoading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sidebarOpen = ref(false)
    const isCreatingNew = ref(false)
    const editingPackage = ref(null)
    const isSaving = ref(false)
    const availableRewards = ref([])
    const loadingRewards = ref(false)

    // Toast
    const toastVisible = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    let toastTimer = null

    function showToast(message, type = 'success') {
      toastMessage.value = message
      toastType.value = type
      toastVisible.value = true
      if (toastTimer) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        toastVisible.value = false
      }, 4000)
    }

    // Debounce helper
    let searchTimer = null
    function onSearchInput(e) {
      searchQuery.value = e?.target?.value || ''
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => fetchPackageList(), 350)
    }

    function onStatusChange(e) {
      statusFilter.value = e?.target?.value || ''
      fetchPackageList()
    }

    // Data fetching
    async function fetchPackageList() {
      listLoading.value = true
      setIsLoadingVar(true)
      try {
        const params = {}
        if (statusFilter.value) params.p_status = statusFilter.value
        if (searchQuery.value?.trim()) params.p_search = searchQuery.value.trim()
        const result = await api.rpc('bff_admin_get_package_list', params)
        if (result?.success) {
          packages.value = result?.data || []
          setPackageCount(packages.value.length)
          emit('trigger-event', {
            name: 'list-loaded',
            event: { packages: packages.value, count: packages.value.length },
          })
        } else {
          showToast(result?.title || 'Failed to load packages', 'error')
          emit('trigger-event', {
            name: 'error',
            event: { message: result?.title || 'Failed to load packages' },
          })
        }
      } catch (err) {
        showToast(err?.message || 'Network error', 'error')
        emit('trigger-event', {
          name: 'error',
          event: { message: err?.message || 'Network error' },
        })
      } finally {
        listLoading.value = false
        setIsLoadingVar(false)
      }
    }

    async function fetchPackageDetail(id) {
      try {
        const result = await api.rpc('bff_admin_get_package_detail', { p_package_id: id })
        if (result?.success && result?.data) {
          return result.data
        }
        showToast(result?.title || 'Failed to load package', 'error')
        return null
      } catch (err) {
        showToast(err?.message || 'Failed to load package detail', 'error')
        return null
      }
    }

    async function fetchRewards() {
      if (availableRewards.value?.length) return
      loadingRewards.value = true
      try {
        const data = await api.restGet(
          'reward_master?select=id,name,image,description_headline&active_status=eq.true&order=name.asc'
        )
        availableRewards.value = Array.isArray(data) ? data : []
      } catch (err) {
        showToast('Failed to load rewards', 'error')
      } finally {
        loadingRewards.value = false
      }
    }

    function handleSearchRewards() {
      fetchRewards()
    }

    // Sidebar controls
    function openCreate() {
      isCreatingNew.value = true
      editingPackage.value = null
      sidebarOpen.value = true
      setSelectedPackageId('')
      fetchRewards()
      emit('trigger-event', {
        name: 'sidebar-opened',
        event: { mode: 'create', packageId: '' },
      })
    }

    async function openEdit(id) {
      if (!id) return
      isCreatingNew.value = false
      setSelectedPackageId(id)
      sidebarOpen.value = true
      editingPackage.value = null
      fetchRewards()
      const detail = await fetchPackageDetail(id)
      if (detail) {
        editingPackage.value = detail
      } else {
        sidebarOpen.value = false
      }
      emit('trigger-event', {
        name: 'sidebar-opened',
        event: { mode: 'edit', packageId: id },
      })
    }

    function closeSidebar() {
      sidebarOpen.value = false
      editingPackage.value = null
      isCreatingNew.value = false
      setSelectedPackageId('')
      emit('trigger-event', { name: 'sidebar-closed', event: {} })
    }

    // Save handler
    async function handleSave(payload) {
      isSaving.value = true
      try {
        const params = {
          p_name: payload?.name || null,
          p_description: payload?.description || null,
          p_image: payload?.imageUrl ? [payload.imageUrl] : null,
          p_validity_days: payload?.validityDays ?? null,
          p_validity_date: payload?.validityDate || null,
          p_price: payload?.price ?? null,
          p_points_price: payload?.pointsPrice ?? null,
          p_active_status: payload?.activeStatus ?? false,
          p_items: JSON.stringify(payload?.items || []),
        }
        if (payload?.id) {
          params.p_id = payload.id
        }

        const result = await api.rpc('bff_upsert_package_with_items', params)
        if (result?.success) {
          const d = result?.data || {}
          const parts = []
          if (d.children_created) parts.push(`${d.children_created} items added`)
          if (d.children_updated) parts.push(`${d.children_updated} items updated`)
          if (d.children_deleted) parts.push(`${d.children_deleted} items removed`)
          const detail = parts.length ? ` (${parts.join(', ')})` : ''
          showToast(`${result?.title || 'Saved'}${detail}`)
          emit('trigger-event', {
            name: 'package-saved',
            event: {
              packageId: d.parent_id || payload?.id || '',
              title: result?.title || 'Saved',
              data: d,
            },
          })
          closeSidebar()
          await fetchPackageList()
        } else {
          showToast(result?.title || 'Save failed', 'error')
          emit('trigger-event', {
            name: 'error',
            event: { message: result?.title || 'Save failed' },
          })
        }
      } catch (err) {
        showToast(err?.message || 'Save failed', 'error')
        emit('trigger-event', {
          name: 'error',
          event: { message: err?.message || 'Save failed' },
        })
      } finally {
        isSaving.value = false
      }
    }

    // Formatting helpers
    function formatCurrency(val) {
      const num = Number(val)
      if (isNaN(num)) return '—'
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

    function formatNumber(val) {
      const num = Number(val)
      if (isNaN(num)) return '—'
      return num.toLocaleString()
    }

    function formatDate(dateStr) {
      if (!dateStr) return '—'
      try {
        return new Date(dateStr).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return '—'
      }
    }

    // Lifecycle
    onMounted(() => {
      fetchPackageList()
    })

    // Re-fetch when auth token changes
    watch(
      () => props.content?.userAccessToken,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          fetchPackageList()
        }
      }
    )

    // Expose actions
    expose({
      refreshList: () => fetchPackageList(),
      openCreate: () => openCreate(),
      openEdit: ({ packageId } = {}) => {
        if (packageId) openEdit(packageId)
      },
      closeSidebar: () => closeSidebar(),
    })

    return {
      rootRef,
      packages,
      listLoading,
      searchQuery,
      statusFilter,
      sidebarOpen,
      isCreatingNew,
      editingPackage,
      isSaving,
      availableRewards,
      loadingRewards,
      toastVisible,
      toastMessage,
      toastType,
      onSearchInput,
      onStatusChange,
      openCreate,
      openEdit,
      closeSidebar,
      handleSave,
      handleSearchRewards,
      formatCurrency,
      formatNumber,
      formatDate,
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.package-builder {
  @include polaris-tokens;
  font-family: var(--p-font-family-sans);
  position: relative;
  width: 100%;
  min-height: 400px;
  color: var(--p-color-text);
}

// Toast (Pattern 25)
.toast {
  &--success { @include polaris-toast-success; }
  &--error { @include polaris-toast-critical; }
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--p-motion-duration-200) var(--p-motion-ease);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// List View
.list-view {
  padding: var(--p-space-600) var(--p-space-500);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--p-space-400);

  &__title {
    @include polaris-text-heading-lg;
    margin: 0;
  }
}

// Buttons
.btn {
  @include polaris-button-default;

  &--primary {
    @include polaris-button-primary;
  }
}

// Filter bar
.filter-bar {
  display: flex;
  gap: var(--p-space-200);
  margin-bottom: var(--p-space-400);
}

.search-field {
  @include polaris-search-field;
  flex: 1;
  max-width: 320px;
}

.filter-select {
  @include polaris-select;
  width: 160px;
}

// Table
.table-wrap {
  background: var(--p-color-bg-surface);
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-300);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--p-font-size-325);

  th {
    text-align: left;
    padding: var(--p-space-300) var(--p-space-400);
    font-weight: var(--p-font-weight-semibold);
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--p-color-border);
    background: var(--p-color-bg-surface-secondary);
    white-space: nowrap;
  }

  .th--first {
    border-top-left-radius: var(--p-border-radius-300);
  }
  .th--last {
    border-top-right-radius: var(--p-border-radius-300);
  }

  td {
    padding: var(--p-space-300) var(--p-space-400);
    border-bottom: 1px solid var(--p-color-border);
    color: var(--p-color-text);
    vertical-align: middle;
    white-space: nowrap;
  }

  &__row {
    cursor: pointer;
    transition: background var(--p-motion-duration-150) var(--p-motion-ease);

    &:hover {
      background: var(--p-color-bg-surface-hover);
    }

    &:last-child td {
      border-bottom: none;
    }
  }
}

.td--date {
  color: var(--p-color-text-secondary);
  font-size: var(--p-font-size-300);
}

// Package cell
.pkg-cell {
  display: flex;
  align-items: center;
  gap: var(--p-space-300);

  &__thumb {
    width: 40px;
    height: 40px;
    border-radius: var(--p-border-radius-100);
    object-fit: cover;
    border: 1px solid var(--p-color-border);
    flex-shrink: 0;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  &__name {
    font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 240px;
  }
}

// Status badge
.status-badge {
  @include polaris-badge-base;

  &--active {
    background: var(--p-color-bg-fill-success-secondary);
    color: var(--p-color-text-success);
  }

  &--inactive {
    background: var(--p-color-bg-fill);
    color: var(--p-color-text-secondary);
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    .status-badge--active & {
      background: var(--p-color-icon-success);
    }
    .status-badge--inactive & {
      background: var(--p-color-icon);
    }
  }
}

// Loading
.loading-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--p-space-1200);
}

.spinner {
  @include polaris-spinner-large;
}

// Empty state
.empty-wrap {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-color-bg-surface);
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-300);
}

.empty-state {
  @include polaris-empty-state;

  &__icon {
    font-size: 48px;
    display: block;
    margin-bottom: var(--p-space-300);
  }

  &__heading {
    @include polaris-empty-state-heading;
  }

  &__text {
    @include polaris-empty-state-content;
  }
}

// Sidebar overlay (Pattern 23)
.sidebar-overlay {
  @include polaris-drawer-overlay;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity var(--p-motion-duration-200) var(--p-motion-ease);
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform var(--p-motion-duration-300) var(--p-motion-ease);
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
}
</style>
