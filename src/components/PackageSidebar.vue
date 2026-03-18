<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar__header">
      <div class="sidebar__header-left">
        <button class="btn-icon" @click="$emit('cancel')" title="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.707 4.293a1 1 0 0 1 0 1.414L8.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0z"/>
          </svg>
        </button>
        <h2 class="sidebar__title">{{ isNew ? 'Create Package' : 'Edit Package' }}</h2>
        <span v-if="isDirty" class="unsaved-badge">Unsaved</span>
      </div>
      <button class="btn-icon" @click="$emit('cancel')" title="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.707 5.293a1 1 0 0 0-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 11.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 10l3.293-3.293a1 1 0 0 0-1.414-1.414L10 8.586 6.707 5.293z"/>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="sidebar__content">
      <!-- Validation errors -->
      <div v-if="validationErrors?.length" class="banner banner--critical">
        <div class="banner__content">
          <strong>Please fix the following errors</strong>
          <ul class="error-list">
            <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
          </ul>
        </div>
        <button class="btn-icon btn-icon--sm" @click="validationErrors = []">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.707 5.293a1 1 0 0 0-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 11.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 10l3.293-3.293a1 1 0 0 0-1.414-1.414L10 8.586 6.707 5.293z"/>
          </svg>
        </button>
      </div>

      <!-- Package Details Card -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Package Details</h3>
          <p class="card__desc">Basic information about this package</p>
        </div>
        <div class="card__section">
          <div class="form-stack">
            <div class="field">
              <label class="field__label">
                Name <span class="field__required">*</span>
              </label>
              <input
                class="field__input"
                type="text"
                placeholder="e.g. Welcome Package"
                :value="form.name"
                @input="form.name = $event?.target?.value || ''"
                :class="{ 'field__input--error': nameError }"
              />
              <span v-if="nameError" class="field__error">{{ nameError }}</span>
            </div>

            <div class="field">
              <label class="field__label">Description</label>
              <textarea
                class="field__textarea"
                placeholder="Describe what this package includes…"
                :value="form.description"
                @input="form.description = $event?.target?.value || ''"
                rows="3"
              ></textarea>
            </div>

            <div class="field">
              <label class="field__label">Image URL</label>
              <input
                class="field__input"
                type="text"
                placeholder="https://example.com/image.jpg"
                :value="form.imageUrl"
                @input="form.imageUrl = $event?.target?.value || ''"
              />
              <div v-if="form.imageUrl" class="image-preview">
                <img :src="form.imageUrl" alt="Preview" @error="onImageError" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validity & Pricing Card -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Validity & Pricing</h3>
          <p class="card__desc">Set expiry rules and optional pricing</p>
        </div>
        <div class="card__section">
          <div class="form-stack">
            <!-- Validity mode -->
            <div class="field">
              <label class="field__label">Validity</label>
              <div class="radio-cards">
                <label
                  class="radio-card"
                  :class="{ 'radio-card--active': form.validityMode === 'none' }"
                >
                  <input
                    type="radio"
                    value="none"
                    :checked="form.validityMode === 'none'"
                    @change="form.validityMode = 'none'"
                  />
                  <div>
                    <span class="radio-card__title">No expiry</span>
                    <span class="radio-card__desc">Never expires</span>
                  </div>
                </label>
                <label
                  class="radio-card"
                  :class="{ 'radio-card--active': form.validityMode === 'days' }"
                >
                  <input
                    type="radio"
                    value="days"
                    :checked="form.validityMode === 'days'"
                    @change="form.validityMode = 'days'"
                  />
                  <div>
                    <span class="radio-card__title">Days from assignment</span>
                    <span class="radio-card__desc">Valid for N days after assigned</span>
                  </div>
                </label>
                <label
                  class="radio-card"
                  :class="{ 'radio-card--active': form.validityMode === 'date' }"
                >
                  <input
                    type="radio"
                    value="date"
                    :checked="form.validityMode === 'date'"
                    @change="form.validityMode = 'date'"
                  />
                  <div>
                    <span class="radio-card__title">Specific date</span>
                    <span class="radio-card__desc">Valid until a fixed date</span>
                  </div>
                </label>
              </div>
            </div>

            <div v-if="form.validityMode === 'days'" class="field">
              <label class="field__label">Number of days</label>
              <input
                class="field__input field__input--narrow"
                type="number"
                min="1"
                :value="form.validityDays"
                @input="form.validityDays = parseIntSafe($event?.target?.value)"
              />
            </div>

            <div v-if="form.validityMode === 'date'" class="field">
              <label class="field__label">Expiry date</label>
              <input
                class="field__date"
                type="date"
                :value="form.validityDate"
                @input="form.validityDate = $event?.target?.value || ''"
              />
            </div>

            <div class="field-row">
              <div class="field field--half">
                <label class="field__label">Price</label>
                <input
                  class="field__input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Leave empty if free"
                  :value="form.price"
                  @input="form.price = parseFloatSafe($event?.target?.value)"
                />
                <span class="field__help">Monetary price for purchasable packages</span>
              </div>
              <div class="field field--half">
                <label class="field__label">Points Price</label>
                <input
                  class="field__input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave empty if no points cost"
                  :value="form.pointsPrice"
                  @input="form.pointsPrice = parseFloatSafe($event?.target?.value)"
                />
                <span class="field__help">Points cost for this package</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Items Card -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Package Items</h3>
          <p class="card__desc">Rewards included in this package with quantities</p>
        </div>
        <div class="card__section">
          <!-- Items list -->
          <div v-if="form.items?.length" class="items-list">
            <div
              v-for="(item, idx) in form.items"
              :key="item._key"
              class="item-row"
            >
              <div class="item-row__header">
                <div class="item-row__info">
                  <img
                    v-if="item.reward_image?.length"
                    :src="item.reward_image[0]"
                    class="item-row__thumb"
                    alt=""
                  />
                  <div class="item-row__text">
                    <span class="item-row__name">{{ item.reward_name || 'Unknown Reward' }}</span>
                    <span class="item-row__id">{{ item.reward_id?.substring(0, 8) }}…</span>
                  </div>
                </div>
                <div class="item-row__actions">
                  <button
                    class="btn-icon btn-icon--sm"
                    :disabled="idx === 0"
                    @click="moveItem(idx, -1)"
                    title="Move up"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a.997.997 0 0 0-.707.293l-5 5a.999.999 0 1 0 1.414 1.414L10 8.414l4.293 4.293a.999.999 0 1 0 1.414-1.414l-5-5A.997.997 0 0 0 10 6z"/>
                    </svg>
                  </button>
                  <button
                    class="btn-icon btn-icon--sm"
                    :disabled="idx === form.items.length - 1"
                    @click="moveItem(idx, 1)"
                    title="Move down"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 14a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414L10 11.586l4.293-4.293a.999.999 0 1 1 1.414 1.414l-5 5A.997.997 0 0 1 10 14z"/>
                    </svg>
                  </button>
                  <button
                    class="btn-icon btn-icon--sm btn-icon--danger"
                    @click="removeItem(idx)"
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.707 5.293a1 1 0 0 0-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 11.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 10l3.293-3.293a1 1 0 0 0-1.414-1.414L10 8.586 6.707 5.293z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="item-row__config">
                <div class="field field--compact">
                  <label class="field__label field__label--sm">Quantity</label>
                  <input
                    class="field__input field__input--narrow"
                    type="number"
                    min="1"
                    :value="item.qty"
                    @input="item.qty = parseIntSafe($event?.target?.value) || 1"
                  />
                </div>

                <div class="field field--compact">
                  <label class="field__label field__label--sm">Type</label>
                  <div class="segmented-pill">
                    <button
                      class="segmented-pill__btn"
                      :class="{ 'segmented-pill__btn--active': !item.is_elective }"
                      @click="setItemType(idx, 'mandatory')"
                    >Mandatory</button>
                    <button
                      class="segmented-pill__btn"
                      :class="{ 'segmented-pill__btn--active': item.is_elective }"
                      @click="setItemType(idx, 'elective')"
                    >Elective</button>
                  </div>
                </div>
              </div>

              <div v-if="item.is_elective" class="item-row__elective">
                <div class="field field--compact">
                  <label class="field__label field__label--sm">Elective group</label>
                  <input
                    class="field__input"
                    type="text"
                    placeholder="e.g. wellness-choices"
                    :value="item.elective_group"
                    @input="item.elective_group = $event?.target?.value || ''"
                  />
                </div>
                <div class="field field--compact">
                  <label class="field__label field__label--sm">Max picks</label>
                  <input
                    class="field__input field__input--narrow"
                    type="number"
                    min="1"
                    :value="item.elective_max_picks"
                    @input="item.elective_max_picks = parseIntSafe($event?.target?.value)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="items-empty">
            <p>No rewards added yet. Use the button below to add rewards to this package.</p>
          </div>

          <!-- Add reward button / picker -->
          <div class="reward-picker">
            <button
              v-if="!showRewardPicker"
              class="btn btn--outline btn--full"
              @click="openRewardPicker"
            >
              + Add Reward
            </button>

            <div v-if="showRewardPicker" class="reward-picker__panel">
              <div class="reward-picker__search">
                <input
                  ref="rewardSearchRef"
                  class="search-field"
                  type="text"
                  placeholder="Search rewards…"
                  :value="rewardSearch"
                  @input="rewardSearch = $event?.target?.value || ''"
                />
                <button class="btn-icon btn-icon--sm" @click="showRewardPicker = false">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.707 5.293a1 1 0 0 0-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 11.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 10l3.293-3.293a1 1 0 0 0-1.414-1.414L10 8.586 6.707 5.293z"/>
                  </svg>
                </button>
              </div>

              <div v-if="loadingRewards" class="reward-picker__loading">
                <span class="spinner-sm"></span>
              </div>
              <div v-else class="reward-picker__list">
                <div
                  v-for="reward in filteredRewards"
                  :key="reward?.id"
                  class="reward-option"
                  @click="addReward(reward)"
                >
                  <img
                    v-if="reward?.image?.length"
                    :src="reward.image[0]"
                    class="reward-option__thumb"
                    alt=""
                  />
                  <div class="reward-option__text">
                    <span class="reward-option__name">{{ reward?.name || 'Untitled' }}</span>
                    <span v-if="reward?.description_headline" class="reward-option__desc">
                      {{ reward.description_headline }}
                    </span>
                  </div>
                  <span v-if="isRewardAdded(reward?.id)" class="reward-option__added">Added</span>
                </div>
                <div v-if="!filteredRewards?.length" class="reward-picker__empty">
                  No rewards found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar__footer">
      <button class="btn" @click="$emit('cancel')">Cancel</button>
      <div class="sidebar__footer-right">
        <button class="btn" :disabled="isSaving" @click="saveDraft">
          {{ isSaving ? 'Saving…' : 'Save as Draft' }}
        </button>
        <button class="btn btn--primary" :disabled="isSaving" @click="saveActivate">
          {{ isSaving ? 'Saving…' : 'Save & Activate' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'

export default {
  props: {
    packageData: { type: Object, default: null },
    isNew: { type: Boolean, default: true },
    isSaving: { type: Boolean, default: false },
    availableRewards: { type: Array, default: () => [] },
    loadingRewards: { type: Boolean, default: false },
  },
  emits: ['save', 'cancel', 'search-rewards'],
  setup(props, { emit }) {
    let keyCounter = 0
    function genKey() {
      return `_k${++keyCounter}_${Date.now()}`
    }

    // Form state
    const form = reactive({
      name: '',
      description: '',
      imageUrl: '',
      validityMode: 'none',
      validityDays: null,
      validityDate: '',
      price: null,
      pointsPrice: null,
      items: [],
    })

    const validationErrors = ref([])
    const showRewardPicker = ref(false)
    const rewardSearch = ref('')
    const rewardSearchRef = ref(null)
    const initialSnapshot = ref('')

    function populateForm(data) {
      form.name = data?.name || ''
      form.description = data?.description || ''
      form.imageUrl = data?.image?.length ? data.image[0] : ''

      if (data?.validity_days) {
        form.validityMode = 'days'
        form.validityDays = data.validity_days
        form.validityDate = ''
      } else if (data?.validity_date) {
        form.validityMode = 'date'
        form.validityDays = null
        form.validityDate = data.validity_date?.substring(0, 10) || ''
      } else {
        form.validityMode = 'none'
        form.validityDays = null
        form.validityDate = ''
      }

      form.price = data?.price ?? null
      form.pointsPrice = data?.points_price ?? null

      form.items = (data?.items || []).map(item => ({
        _key: genKey(),
        id: item?.id || null,
        reward_id: item?.reward_id || '',
        reward_name: item?.reward_name || '',
        reward_image: item?.reward_image || [],
        qty: item?.qty || 1,
        is_mandatory: item?.is_mandatory ?? true,
        is_elective: item?.is_elective ?? false,
        elective_group: item?.elective_group || '',
        elective_max_picks: item?.elective_max_picks ?? null,
        ranking: item?.ranking ?? 0,
      }))

      nextTick(() => {
        initialSnapshot.value = JSON.stringify(form)
      })
    }

    watch(
      () => props.packageData,
      data => {
        if (data) {
          populateForm(data)
        } else {
          resetForm()
        }
      },
      { immediate: true }
    )

    watch(
      () => props.isNew,
      isNew => {
        if (isNew && !props.packageData) {
          resetForm()
        }
      },
      { immediate: true }
    )

    function resetForm() {
      form.name = ''
      form.description = ''
      form.imageUrl = ''
      form.validityMode = 'none'
      form.validityDays = null
      form.validityDate = ''
      form.price = null
      form.pointsPrice = null
      form.items = []
      validationErrors.value = []
      nextTick(() => {
        initialSnapshot.value = JSON.stringify(form)
      })
    }

    const isDirty = computed(() => {
      return JSON.stringify(form) !== initialSnapshot.value
    })

    const nameError = computed(() => {
      if (validationErrors.value?.length && !form.name?.trim()) {
        return 'Name is required'
      }
      return ''
    })

    // Item management
    function setItemType(idx, type) {
      const item = form.items?.[idx]
      if (!item) return
      if (type === 'mandatory') {
        item.is_mandatory = true
        item.is_elective = false
        item.elective_group = ''
        item.elective_max_picks = null
      } else {
        item.is_mandatory = false
        item.is_elective = true
      }
    }

    function moveItem(idx, direction) {
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= form.items.length) return
      const temp = form.items[idx]
      form.items[idx] = form.items[newIdx]
      form.items[newIdx] = temp
    }

    function removeItem(idx) {
      form.items.splice(idx, 1)
    }

    // Reward picker
    const filteredRewards = computed(() => {
      const q = rewardSearch.value?.toLowerCase()?.trim()
      const rewards = props.availableRewards || []
      if (!q) return rewards
      return rewards.filter(
        r =>
          r?.name?.toLowerCase()?.includes(q) ||
          r?.description_headline?.toLowerCase()?.includes(q)
      )
    })

    function isRewardAdded(rewardId) {
      if (!rewardId) return false
      return form.items?.some(i => i?.reward_id === rewardId)
    }

    function addReward(reward) {
      if (!reward?.id) return
      form.items.push({
        _key: genKey(),
        id: null,
        reward_id: reward.id,
        reward_name: reward.name || '',
        reward_image: reward.image || [],
        qty: 1,
        is_mandatory: true,
        is_elective: false,
        elective_group: '',
        elective_max_picks: null,
        ranking: form.items.length,
      })
      showRewardPicker.value = false
      rewardSearch.value = ''
    }

    function openRewardPicker() {
      showRewardPicker.value = true
      rewardSearch.value = ''
      emit('search-rewards')
      nextTick(() => {
        rewardSearchRef.value?.focus?.()
      })
    }

    // Validation
    function validate() {
      const errors = []
      if (!form.name?.trim()) {
        errors.push('Package name is required')
      }
      if (form.validityMode === 'days' && (!form.validityDays || form.validityDays < 1)) {
        errors.push('Validity days must be at least 1')
      }
      if (form.validityMode === 'date' && !form.validityDate) {
        errors.push('Expiry date is required when using specific date mode')
      }
      form.items?.forEach((item, idx) => {
        if (!item?.reward_id) {
          errors.push(`Item ${idx + 1}: Reward is required`)
        }
        if (!item?.qty || item.qty < 1) {
          errors.push(`Item ${idx + 1}: Quantity must be at least 1`)
        }
        if (item?.is_elective && !item?.elective_group?.trim()) {
          errors.push(`Item ${idx + 1}: Elective group is required for elective items`)
        }
        if (item?.is_elective && (!item?.elective_max_picks || item.elective_max_picks < 1)) {
          errors.push(`Item ${idx + 1}: Max picks is required for elective items`)
        }
      })
      return errors
    }

    // Save handlers
    function buildPayload(activeStatus) {
      const errors = validate()
      validationErrors.value = errors
      if (errors.length) return null

      const items = form.items.map((item, idx) => ({
        id: item?.id || undefined,
        reward_id: item?.reward_id,
        qty: item?.qty || 1,
        is_mandatory: !item?.is_elective,
        is_elective: !!item?.is_elective,
        elective_group: item?.is_elective ? (item?.elective_group || null) : null,
        elective_max_picks: item?.is_elective ? (item?.elective_max_picks || null) : null,
        ranking: idx,
      }))

      return {
        id: props.packageData?.id || null,
        name: form.name?.trim(),
        description: form.description?.trim() || null,
        imageUrl: form.imageUrl?.trim() || null,
        validityDays: form.validityMode === 'days' ? form.validityDays : null,
        validityDate: form.validityMode === 'date' ? form.validityDate : null,
        price: form.price,
        pointsPrice: form.pointsPrice,
        activeStatus: activeStatus,
        items: items,
      }
    }

    function saveDraft() {
      const payload = buildPayload(false)
      if (payload) emit('save', payload)
    }

    function saveActivate() {
      const payload = buildPayload(true)
      if (payload) emit('save', payload)
    }

    // Helpers
    function parseIntSafe(val) {
      if (val === '' || val === null || val === undefined) return null
      const n = parseInt(val, 10)
      return isNaN(n) ? null : n
    }

    function parseFloatSafe(val) {
      if (val === '' || val === null || val === undefined) return null
      const n = parseFloat(val)
      return isNaN(n) ? null : n
    }

    function onImageError(e) {
      if (e?.target) e.target.style.display = 'none'
    }

    return {
      form,
      validationErrors,
      isDirty,
      nameError,
      showRewardPicker,
      rewardSearch,
      rewardSearchRef,
      filteredRewards,
      setItemType,
      moveItem,
      removeItem,
      isRewardAdded,
      addReward,
      openRewardPicker,
      saveDraft,
      saveActivate,
      parseIntSafe,
      parseFloatSafe,
      onImageError,
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.sidebar {
  @include polaris-tokens;
  @include polaris-drawer(560px);
  font-family: var(--p-font-family-sans);
}

// Header (Pattern 23)
.sidebar__header {
  @include polaris-drawer-header;
}

.sidebar__header-left {
  display: flex;
  align-items: center;
  gap: var(--p-space-200);
}

.sidebar__title {
  font-size: var(--p-font-size-400);
  font-weight: var(--p-font-weight-semibold);
  color: var(--p-color-text);
  margin: 0;
}

.unsaved-badge {
  @include polaris-badge-warning;
}

// Content (Pattern 23)
.sidebar__content {
  @include polaris-drawer-content;
}

// Footer (Pattern 23)
.sidebar__footer {
  @include polaris-drawer-footer;
  justify-content: space-between;
}

.sidebar__footer-right {
  display: flex;
  gap: var(--p-space-200);
}

// Banner
.banner {
  @include polaris-banner-base;

  &--critical {
    background: var(--p-color-bg-fill-critical-secondary);
    border: 1px solid var(--p-color-border-critical);
  }

  &__content {
    flex: 1;
    font-size: var(--p-font-size-325);
    color: var(--p-color-text-critical);

    strong {
      display: block;
      margin-bottom: var(--p-space-100);
    }
  }
}

.error-list {
  margin: var(--p-space-100) 0 0;
  padding-left: var(--p-space-400);

  li {
    margin-bottom: var(--p-space-100);
    &:last-child { margin-bottom: 0; }
  }
}

// Card
.card {
  @include polaris-card;

  &__header {
    padding: var(--p-space-400) var(--p-space-400) 0;
  }

  &__title {
    @include polaris-text-heading-sm;
    margin: 0 0 var(--p-space-100);
  }

  &__desc {
    @include polaris-text-description;
    margin: 0;
  }

  &__section {
    @include polaris-card-section;
  }
}

// Forms
.form-stack {
  @include polaris-block-stack(var(--p-space-400));
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-100);

  &--half {
    flex: 1;
    min-width: 0;
  }

  &--compact {
    gap: var(--p-space-050);
  }

  &__label {
    @include polaris-label;
    font-size: var(--p-font-size-325);

    &--sm {
      font-size: var(--p-font-size-275);
      color: var(--p-color-text-secondary);
    }
  }

  &__required {
    color: var(--p-color-text-critical);
  }

  &__input {
    @include polaris-input;

    &--narrow {
      max-width: 120px;
    }

    &--error {
      border-color: var(--p-color-border-critical);

      &:focus {
        box-shadow: 0 0 0 1px var(--p-color-border-critical);
      }
    }
  }

  &__textarea {
    @include polaris-textarea;
  }

  &__date {
    @include polaris-date-field;
  }

  &__help {
    @include polaris-help-text;
  }

  &__error {
    @include polaris-error-text;
  }
}

.field-row {
  display: flex;
  gap: var(--p-space-300);
}

// Radio cards (Pattern 12)
.radio-cards {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-150);
}

.radio-card {
  display: flex;
  align-items: flex-start;
  gap: var(--p-space-200);
  padding: var(--p-space-300);
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  cursor: pointer;
  transition: all var(--p-motion-duration-150) var(--p-motion-ease);
  background: var(--p-color-bg-surface);

  input[type='radio'] {
    @include polaris-radio;
    margin-top: 2px;
  }

  &:hover {
    background: var(--p-color-bg-surface-hover);
  }

  &--active {
    border-color: var(--p-color-border-brand);
    background: var(--p-color-bg-surface-selected);
  }

  &__title {
    display: block;
    font-size: var(--p-font-size-300);
    font-weight: var(--p-font-weight-medium);
    color: var(--p-color-text);
  }

  &__desc {
    display: block;
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    margin-top: 1px;
  }
}

// Image preview
.image-preview {
  margin-top: var(--p-space-100);

  img {
    max-width: 120px;
    max-height: 80px;
    border-radius: var(--p-border-radius-100);
    border: 1px solid var(--p-color-border);
    object-fit: cover;
  }
}

// Segmented pill
.segmented-pill {
  @include polaris-segmented-pill;
}

.segmented-pill__btn {
  @include polaris-segmented-pill-btn;

  &--active {
    @include polaris-segmented-pill-btn-active;
  }
}

// Items list
.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-space-200);
  margin-bottom: var(--p-space-300);
}

.item-row {
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  background: var(--p-color-bg-surface);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--p-space-200) var(--p-space-300);
    border-bottom: 1px solid var(--p-color-border);
    background: var(--p-color-bg-surface-secondary);
  }

  &__info {
    display: flex;
    align-items: center;
    gap: var(--p-space-200);
    flex: 1;
    min-width: 0;
  }

  &__thumb {
    width: 32px;
    height: 32px;
    border-radius: var(--p-border-radius-100);
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--p-color-border);
  }

  &__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-size: var(--p-font-size-325);
    font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__id {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    font-family: var(--p-font-family-mono);
  }

  &__actions {
    display: flex;
    gap: var(--p-space-050);
    flex-shrink: 0;
  }

  &__config {
    display: flex;
    align-items: flex-end;
    gap: var(--p-space-400);
    padding: var(--p-space-300);
  }

  &__elective {
    display: flex;
    gap: var(--p-space-300);
    padding: 0 var(--p-space-300) var(--p-space-300);
    border-top: 1px dashed var(--p-color-border);
    padding-top: var(--p-space-300);
  }
}

.items-empty {
  padding: var(--p-space-400);
  text-align: center;
  color: var(--p-color-text-secondary);
  font-size: var(--p-font-size-325);
  background: var(--p-color-bg-surface-secondary);
  border-radius: var(--p-border-radius-200);
  border: 1px dashed var(--p-color-border);

  p { margin: 0; }
}

// Reward picker
.reward-picker {
  margin-top: var(--p-space-200);
}

.reward-picker__panel {
  border: 1px solid var(--p-color-border);
  border-radius: var(--p-border-radius-200);
  overflow: hidden;
}

.reward-picker__search {
  display: flex;
  gap: var(--p-space-200);
  padding: var(--p-space-200);
  border-bottom: 1px solid var(--p-color-border);
  background: var(--p-color-bg-surface-secondary);

  .search-field {
    @include polaris-search-field;
    flex: 1;
  }
}

.reward-picker__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--p-space-600);
}

.spinner-sm {
  @include polaris-spinner;
}

.reward-picker__list {
  max-height: 280px;
  overflow-y: auto;
}

.reward-picker__empty {
  padding: var(--p-space-400);
  text-align: center;
  color: var(--p-color-text-secondary);
  font-size: var(--p-font-size-325);
}

.reward-option {
  display: flex;
  align-items: center;
  gap: var(--p-space-200);
  padding: var(--p-space-200) var(--p-space-300);
  cursor: pointer;
  transition: background var(--p-motion-duration-100) var(--p-motion-ease);
  border-bottom: 1px solid var(--p-color-border);

  &:last-child { border-bottom: none; }
  &:hover { background: var(--p-color-bg-surface-hover); }

  &__thumb {
    width: 36px;
    height: 36px;
    border-radius: var(--p-border-radius-100);
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--p-color-border);
  }

  &__text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__name {
    font-size: var(--p-font-size-325);
    font-weight: var(--p-font-weight-medium);
    color: var(--p-color-text);
  }

  &__desc {
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__added {
    @include polaris-badge-info;
    flex-shrink: 0;
  }
}

// Buttons
.btn {
  @include polaris-button-default;

  &--primary {
    @include polaris-button-primary;
  }

  &--outline {
    @include polaris-button-outline;
  }

  &--full {
    @include polaris-button-full-width;
  }
}

.btn-icon {
  @include polaris-button-icon;

  &--sm {
    @include polaris-button-icon-small;
  }

  &--danger {
    @include polaris-button-icon-danger;
  }
}

// Search
.search-field {
  @include polaris-search-field;
}
</style>
