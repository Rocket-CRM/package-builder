<template>
  <div class="es" ref="rootRef">
    <div class="es__layout" ref="layoutRef">
      <!-- LEFT COLUMN -->
      <div class="es__col es__col--left">
        <div class="es__col-head">
          <h2 class="es__title">Earn factor group</h2>
          <button class="es__primary-btn" @click="openCreateFactorGroup">Create</button>
        </div>
        <div class="es__rows">
          <div v-if="loadingFactorGroups" class="es__loading"><div class="es__spinner"></div></div>
          <template v-else>
            <!-- Connected factors first -->
            <div v-for="f in connectedFactors" :key="f.id" :data-factor-id="f.id" class="es__card es__card--factor">
              <div class="es__card-accent" :style="{ background: getGroupColor(f.earn_factor_group_id) }"></div>
              <div class="es__card-body">
                <div class="es__card-icon" :class="f.target_currency === 'ticket' ? 'es__card-icon--credit' : 'es__card-icon--points'">
                  <svg v-if="f.earn_factor_type === 'rate'" width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.39 4.84L17.27 7.6l-3.64 3.54.86 5.01L10 13.77l-4.49 2.36.86-5L2.73 7.6l4.88-.76L10 2z" fill="currentColor"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 3L12.5 8H17L13.5 11.5L15 17L10 14L5 17L6.5 11.5L3 8H7.5L10 3Z" fill="currentColor"/></svg>
                </div>
                <div class="es__card-info">
                  <div class="es__card-name">{{ getFactorTitle(f) }}</div>
                  <div class="es__card-sub">
                    <span class="es__card-group-tag" :style="{ color: getGroupColor(f.earn_factor_group_id) }">{{ getGroupName(f.earn_factor_group_id) }}</span>
                    <span class="es__card-dot"></span>
                    <span>{{ getFactorType(f) }}</span>
                  </div>
                </div>
                <span v-if="f.earn_factor_type === 'multiplier'" class="es__card-mult">{{ f.earn_factor_amount || 0 }}x</span>
                <button class="es__card-edit" @click="handleEditFactor(f)">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                </button>
              </div>
              <button class="es__card-connect" @click="handleConnectFactor(f, $event)">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </button>
            </div>

            <!-- Separator if both lists have content -->
            <div v-if="connectedFactors.length && unconnectedEntries.length" class="es__divider">
              <span>Unlinked</span>
            </div>

            <!-- Unlinked groups + factors at bottom -->
            <template v-for="entry in unconnectedEntries" :key="entry.key">
              <!-- Group header for groups with no connected factors -->
              <div v-if="entry.type === 'group'" class="es__unlinked-label">
                <div class="es__unlinked-icon" :style="{ background: getGroupColor(entry.groupId) }">
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="7" height="5" rx="1" fill="#fff" opacity=".8"/><rect x="2" y="11" width="7" height="5" rx="1" fill="#fff" opacity=".6"/><rect x="11" y="4" width="7" height="5" rx="1" fill="#fff" opacity=".4"/><rect x="11" y="11" width="7" height="5" rx="1" fill="#fff" opacity=".3"/></svg>
                </div>
                <span>{{ entry.name }}</span>
                <button class="es__link-btn" @click="handleAddFactor(entry)">+ Add earn factor</button>
                <button class="es__card-edit" @click="handleEditFactorGroup()">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                </button>
              </div>
              <!-- Unlinked factor card -->
              <div v-if="entry.type === 'factor'" :data-factor-id="entry.factor.id" class="es__card es__card--factor es__card--dim">
                <div class="es__card-accent" :style="{ background: getGroupColor(entry.factor.earn_factor_group_id) }"></div>
                <div class="es__card-body">
                  <div class="es__card-icon" :class="entry.factor.target_currency === 'ticket' ? 'es__card-icon--credit' : 'es__card-icon--points'">
                    <svg v-if="entry.factor.earn_factor_type === 'rate'" width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.39 4.84L17.27 7.6l-3.64 3.54.86 5.01L10 13.77l-4.49 2.36.86-5L2.73 7.6l4.88-.76L10 2z" fill="currentColor"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 3L12.5 8H17L13.5 11.5L15 17L10 14L5 17L6.5 11.5L3 8H7.5L10 3Z" fill="currentColor"/></svg>
                  </div>
                  <div class="es__card-info">
                    <div class="es__card-name">{{ getFactorTitle(entry.factor) }}</div>
                    <div class="es__card-sub"><span>{{ getFactorType(entry.factor) }}</span></div>
                  </div>
                  <button class="es__card-edit" @click="handleEditFactor(entry.factor)">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                  </button>
                </div>
                <button class="es__card-connect" @click="handleConnectFactor(entry.factor, $event)">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
              </div>
            </template>
            <div v-if="!factorGroups?.length" class="es__empty">No earn factor groups yet.</div>
          </template>
        </div>
      </div>

      <!-- SVG CONNECTIONS -->
      <svg class="es__svg" ref="svgRef">
        <path v-for="ln in lines" :key="ln.key" :d="ln.d" fill="none"
          :stroke="hoveredLine === ln.key ? '#0262E0' : '#CCCCCC'"
          :stroke-width="hoveredLine === ln.key ? 2.5 : 1.5"
          @mouseenter="hoveredLine = ln.key" @mouseleave="hoveredLine = null" style="cursor:pointer" />
      </svg>

      <!-- RIGHT COLUMN -->
      <div class="es__col es__col--right">
        <div class="es__col-head">
          <h2 class="es__title">Earn Conditions group</h2>
          <button class="es__primary-btn" @click="openCreateConditionGroup">Create</button>
        </div>
        <div class="es__rows">
          <div v-if="loadingConditionGroups" class="es__loading"><div class="es__spinner"></div></div>
          <template v-else>
            <div v-for="entry in rightEntries" :key="entry.dk" :data-cg-key="entry.dk"
              class="es__card es__card--condition" :class="{ 'es__card--dim': !entry.factorId }"
              @click="() => { expandedRight[entry.dk] = !expandedRight[entry.dk]; scheduleLineUpdate(); }">
              <div class="es__card-dot"></div>
              <div class="es__card-body">
                <div class="es__cg-icon" :style="cgIconStyle(entry.group?.id)">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="5" height="14" rx="1.5" fill="currentColor" opacity=".7"/><rect x="10" y="6" width="5" height="11" rx="1.5" fill="currentColor" opacity=".5"/></svg>
                </div>
                <div class="es__card-info">
                  <div class="es__card-name">{{ entry.group?.name || 'Untitled' }}</div>
                  <div class="es__card-sub">
                    <span>{{ entry.conditions?.length || 0 }} condition{{ (entry.conditions?.length || 0) !== 1 ? 's' : '' }}</span>
                    <template v-if="entry.linkedCount > 0">
                      <span class="es__card-dot-sep"></span>
                      <span>{{ entry.linkedCount }} linked</span>
                    </template>
                  </div>
                </div>
                <button class="es__link-btn" @click.stop="handleEditConditionGroup(entry.group)">+ Add Condition</button>
                <button class="es__card-edit" @click.stop="handleEditConditionGroup(entry.group)">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                </button>
              </div>
            </div>
            <div v-if="!rightEntries?.length" class="es__empty">No condition groups yet.</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Panels -->
    <transition name="slide">
      <EarnFactorConfig v-if="panel === 'factor'" :factor="editingFactor" :group-id="editingGroupId"
        :condition-groups="allCondGroups" :ticket-types="ticketTypes" :panel-width="content?.configPanelWidth || '400px'"
        @close="panel = null" @save="saveFactorConfig" />
    </transition>
    <transition name="slide">
      <EarnConditionGroupConfig v-if="panel === 'condition'" :group="editingCondGroup"
        :all-entity-options="entityOptions" :panel-width="content?.configPanelWidth || '400px'"
        @close="panel = null" @save="saveCondGroupConfig" />
    </transition>
    <CreateGroupModal v-if="showModal" :type="modalType" @close="showModal = false" @save="handleModalSave" />
    <ConnectPopup v-if="connectPopup.open" :condition-groups="allCondGroups" :position="connectPopup.pos"
      @close="connectPopup.open = false" @select="handleConnectSelect" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { useApi } from './useApi.js';
import EarnFactorConfig from './components/EarnFactorConfig.vue';
import EarnConditionGroupConfig from './components/EarnConditionGroupConfig.vue';
import CreateGroupModal from './components/CreateGroupModal.vue';
import ConnectPopup from './components/ConnectPopup.vue';

const GROUP_COLORS = ['#2C6ECB', '#D82C0D', '#8A6116', '#29845A', '#6D28D9', '#0D9488', '#C05717', '#4F46E5'];

function hashStr(s) { let h = 0; for (let i = 0; i < (s||'').length; i++) { h = ((h<<5)-h)+s.charCodeAt(i); h |= 0; } return Math.abs(h); }

export default {
  components: { EarnFactorConfig, EarnConditionGroupConfig, CreateGroupModal, ConnectPopup },
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    const api = useApi(props);
    const rootRef = ref(null), layoutRef = ref(null), svgRef = ref(null);

    const factorGroups = ref([]);
    const factorsByGroup = ref({});
    const allCondGroups = ref([]);
    const condCache = ref({});
    const entityOptions = ref([]);
    const ticketTypes = ref([]);
    const loadingFactorGroups = ref(false);
    const loadingConditionGroups = ref(false);
    const expandedRight = ref({});
    const panel = ref(null);
    const editingFactor = ref(null);
    const editingGroupId = ref(null);
    const editingCondGroup = ref(null);
    const showModal = ref(false);
    const modalType = ref('factor');
    const hoveredLine = ref(null);
    const connectPopup = ref({ open: false, pos: null, factorId: null, groupId: null });
    const lines = ref([]);
    let lineTimer = null, ro = null;

    const groupNameMap = computed(() => {
      const m = {};
      for (const g of factorGroups.value || []) { if (g?.id) m[g.id] = g.name || 'Untitled Group'; }
      return m;
    });

    function getGroupColor(gid) { return GROUP_COLORS[hashStr(gid) % GROUP_COLORS.length]; }
    function getGroupName(gid) { return groupNameMap.value[gid] || 'Unknown Group'; }
    function cgIconStyle(gid) { const c = getGroupColor(gid); return { background: `${c}12`, color: c }; }

    const connectedFactors = computed(() => {
      return Object.values(factorsByGroup.value || {}).flat().filter(f => f?.earn_conditions_group_id);
    });

    const unconnectedEntries = computed(() => {
      const out = [];
      for (const g of factorGroups.value || []) {
        const factors = factorsByGroup.value[g?.id] || [];
        const unlinked = factors.filter(f => !f?.earn_conditions_group_id);
        const hasLinked = factors.some(f => f?.earn_conditions_group_id);
        if (!hasLinked) {
          out.push({ key: `g-${g.id}`, type: 'group', groupId: g.id, name: g.name || 'Untitled Group' });
          for (const f of unlinked) out.push({ key: `f-${f.id}`, type: 'factor', factor: f });
        } else if (unlinked.length) {
          out.push({ key: `g-${g.id}-u`, type: 'group', groupId: g.id, name: g.name || 'Untitled Group' });
          for (const f of unlinked) out.push({ key: `f-${f.id}`, type: 'factor', factor: f });
        }
      }
      return out;
    });

    const rightEntries = computed(() => {
      const groups = allCondGroups.value || [];
      const allF = Object.values(factorsByGroup.value || {}).flat();
      const out = [], used = new Set();
      for (const f of allF) {
        const cid = f?.earn_conditions_group_id;
        if (!cid) continue;
        const g = groups.find(x => x?.id === cid);
        if (!g) continue;
        used.add(cid);
        out.push({ dk: `${cid}__${f.id}`, group: g, conditions: condCache.value[cid]?.conditions || g?.conditions || [], linkedCount: allF.filter(x => x?.earn_conditions_group_id === cid).length, factorId: f.id });
      }
      for (const g of groups) {
        if (!used.has(g?.id)) out.push({ dk: g.id, group: g, conditions: condCache.value[g.id]?.conditions || g?.conditions || [], linkedCount: 0, factorId: null });
      }
      return out;
    });

    async function loadAll() {
      await Promise.all([loadFactorGroups(), loadCondGroups(), loadEntities()]);
      emit('trigger-event', { name: 'data-loaded', event: { factorGroupCount: factorGroups.value?.length, conditionGroupCount: allCondGroups.value?.length } });
      scheduleLineUpdate();
    }
    async function loadFactorGroups() {
      loadingFactorGroups.value = true;
      try {
        factorGroups.value = await api.fetchEarnFactorGroups() || [];
        const m = {};
        for (const g of factorGroups.value) {
          if (!g?.id) continue;
          const factors = await api.fetchFactorsByGroup(g.id) || [];
          m[g.id] = factors.map(f => ({ ...f, earn_factor_group_id: f.earn_factor_group_id || g.id }));
        }
        factorsByGroup.value = m;
      }
      catch (e) { err('Load failed', e); } finally { loadingFactorGroups.value = false; }
    }
    async function loadCondGroups() {
      loadingConditionGroups.value = true;
      try { allCondGroups.value = await api.fetchAllConditionGroups() || []; const c = {}; for (const g of allCondGroups.value) { if (g?.id) try { c[g.id] = await api.fetchConditionGroupDetails(g.id); } catch {} } condCache.value = c; }
      catch (e) { err('Load failed', e); } finally { loadingConditionGroups.value = false; }
    }
    async function loadEntities() { try { entityOptions.value = await api.fetchEntityOptions() || []; } catch (e) { err('Load failed', e); } }
    function err(m, e) { console.error(m, e); emit('trigger-event', { name: 'error', event: { message: m, code: 'ERR' } }); }

    function scheduleLineUpdate() { clearTimeout(lineTimer); lineTimer = setTimeout(() => nextTick(rebuildLines), 80); }
    function rebuildLines() {
      const layout = layoutRef.value; if (!layout) return;
      const lr = layout.getBoundingClientRect(); const newLines = [];
      for (const f of connectedFactors.value) {
        const cid = f.earn_conditions_group_id;
        const fEl = layout.querySelector(`[data-factor-id="${f.id}"]`);
        const cEl = layout.querySelector(`[data-cg-key="${cid}__${f.id}"]`);
        if (!fEl || !cEl) continue;
        const fR = fEl.getBoundingClientRect(), cR = cEl.getBoundingClientRect();
        const x1 = fR.right - lr.left, y1 = fR.top + fR.height/2 - lr.top;
        const x2 = cR.left - lr.left, y2 = cR.top + cR.height/2 - lr.top;
        const cp = Math.max((x2-x1)*0.4, 30);
        newLines.push({ key: `${f.id}__${cid}`, d: `M ${x1} ${y1} C ${x1+cp} ${y1}, ${x2-cp} ${y2}, ${x2} ${y2}` });
      }
      lines.value = newLines;
    }

    function getFactorTitle(f) { if (!f) return 'Unnamed'; if (f.name || f.target_entity_name) return f.name || f.target_entity_name; const c = f.target_currency === 'ticket' ? 'Credit' : 'Points'; return f.earn_factor_type === 'rate' ? `${c} Starter Rules` : `${c} Power Boost`; }
    function getFactorType(f) { if (!f) return ''; const c = f.target_currency === 'ticket' ? 'Store credit' : 'Points'; return `${c} (${f.earn_factor_type === 'rate' ? 'Base rate' : 'Multiplier'})`; }

    function handleAddFactor(entry) { editingFactor.value = { earn_factor_type: 'rate', public: true, target_currency: 'points', active_status: true }; editingGroupId.value = entry.groupId; panel.value = 'factor'; }
    function handleEditFactor(f) { editingFactor.value = { ...f }; editingGroupId.value = f?.earn_factor_group_id; panel.value = 'factor'; }
    function handleEditFactorGroup() { modalType.value = 'factor'; showModal.value = true; }
    async function handleEditConditionGroup(g) { try { editingCondGroup.value = g?.id ? await api.fetchConditionGroupDetails(g.id) : { id: null, name: '', conditions: [] }; } catch { editingCondGroup.value = { ...g, conditions: g?.conditions || [] }; } panel.value = 'condition'; }
    function openCreateFactorGroup() { modalType.value = 'factor'; showModal.value = true; }
    function openCreateConditionGroup() { editingCondGroup.value = null; panel.value = 'condition'; }
    async function handleModalSave(p) { try { if (modalType.value === 'factor') { await api.upsertEarnFactorGroup({ name: p.name, stackable: p.stackable, window_start: p.window_start, window_end: p.window_end, factors: [] }); await loadFactorGroups(); } } catch (e) { err('Create failed', e); } showModal.value = false; scheduleLineUpdate(); }
    async function saveFactorConfig({ groupId, factor }) { try { const det = await api.fetchEarnFactorGroupDetails(groupId); const ex = det?.factors || []; const up = factor.id ? ex.map(f => f.id === factor.id ? factor : f) : [...ex, factor]; await api.upsertEarnFactorGroup({ id: groupId, factors: up }); await loadFactorGroups(); panel.value = null; } catch (e) { err('Save failed', e); } scheduleLineUpdate(); }
    async function saveCondGroupConfig(payload) { try { await api.upsertConditionGroup(payload); await loadCondGroups(); panel.value = null; } catch (e) { err('Save failed', e); } scheduleLineUpdate(); }
    function handleConnectFactor(f, ev) { const r = ev?.target?.closest?.('.es__card-connect')?.getBoundingClientRect?.() || ev?.target?.getBoundingClientRect?.(); connectPopup.value = { open: true, pos: r ? { x: r.right + 8, y: r.top } : { x: 400, y: 200 }, factorId: f.id, groupId: f.earn_factor_group_id }; }
    async function handleConnectSelect(cg) { const { factorId, groupId } = connectPopup.value; connectPopup.value.open = false; try { const det = await api.fetchEarnFactorGroupDetails(groupId); const fs = (det?.factors || []).map(f => f.id === factorId ? { ...f, earn_conditions_group_id: cg.id } : f); await api.upsertEarnFactorGroup({ id: groupId, factors: fs }); await loadFactorGroups(); await loadCondGroups(); } catch (e) { err('Link failed', e); } scheduleLineUpdate(); }

    onMounted(() => { if (props.content?.authToken) loadAll(); ro = new ResizeObserver(scheduleLineUpdate); nextTick(() => { if (layoutRef.value) ro.observe(layoutRef.value); }); });
    onBeforeUnmount(() => { ro?.disconnect(); clearTimeout(lineTimer); });
    watch(() => props.content?.authToken, t => { if (t) loadAll(); });

    return {
      rootRef, layoutRef, svgRef, content: computed(() => props.content),
      factorGroups, factorsByGroup, allCondGroups, entityOptions, ticketTypes,
      loadingFactorGroups, loadingConditionGroups, expandedRight,
      panel, editingFactor, editingGroupId, editingCondGroup,
      showModal, modalType, hoveredLine, connectPopup,
      connectedFactors, unconnectedEntries, rightEntries, lines,
      getGroupColor, getGroupName, cgIconStyle, getFactorTitle, getFactorType,
      handleAddFactor, handleEditFactor, handleEditFactorGroup,
      handleEditConditionGroup, handleConnectFactor,
      openCreateFactorGroup, openCreateConditionGroup, handleModalSave,
      saveFactorConfig, saveCondGroupConfig, handleConnectSelect,
      scheduleLineUpdate, refreshData: loadAll, closePanel: () => { panel.value = null; },
    };
  },
};
</script>

<style scoped lang="scss">
@import 'polaris-weweb-styles';

$card-height: 60px;

.es {
  @include polaris-tokens;
  font-family: var(--p-font-family-sans);
  color: var(--p-color-text);
  background: #F8FAFC;
  width: 100%; height: 100%; overflow: auto;
  padding: 0 var(--p-space-600) 64px;

  &__layout { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
  &__col { flex-shrink: 0; z-index: 2; position: relative; &--left { width: 520px; } &--right { width: 480px; } }
  &__col-head { display: flex; align-items: center; justify-content: space-between; padding: var(--p-space-600) 0 var(--p-space-400); }
  &__title { @include polaris-text-title; margin: 0; }
  &__primary-btn { @include polaris-button-primary; @include polaris-button-slim; font-size: var(--p-font-size-300); }
  &__rows { display: flex; flex-direction: column; gap: var(--p-space-200); }

  &__svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; overflow: visible; path { pointer-events: stroke; } }

  // ─── Unified card (same height both sides) ───
  &__card {
    position: relative;
    display: flex;
    align-items: stretch;
    height: $card-height;
    background: var(--p-color-bg-surface);
    border: 1px solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    overflow: visible;
    transition: box-shadow 0.1s, border-color 0.1s;

    &:hover {
      box-shadow: var(--p-shadow-card-hover);
      .es__card-edit { opacity: 1; }
      .es__card-connect { opacity: 1; }
    }

    &--factor { border-color: var(--p-color-border-info); box-shadow: var(--p-shadow-card-sm); }
    &--condition { padding-left: var(--p-space-400); }
    &--dim { opacity: 0.6; border-color: var(--p-color-border); &:hover { opacity: 1; } }
  }

  &__card-accent {
    width: 4px; min-width: 4px;
    border-radius: var(--p-border-radius-200) 0 0 var(--p-border-radius-200);
  }

  &__card-dot {
    position: absolute; left: -7px; top: 50%; transform: translateY(-50%);
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--p-color-border-info); border: 2px solid #F8FAFC; z-index: 3;
  }

  &__card-body {
    flex: 1; display: flex; align-items: center; gap: var(--p-space-200);
    padding: 0 var(--p-space-300); min-width: 0;
  }

  &__card-icon {
    width: 28px; height: 28px; min-width: 28px; border-radius: 5px;
    border: 0.7px solid var(--p-color-border); display: flex; align-items: center; justify-content: center;
    &--points { color: var(--p-color-text-info); }
    &--credit { color: var(--p-color-text); }
  }

  &__cg-icon {
    width: 28px; height: 28px; min-width: 28px; border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
  }

  &__card-info { flex: 1; min-width: 0; }
  &__card-name { font-size: var(--p-font-size-325); font-weight: var(--p-font-weight-semibold); color: var(--p-color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__card-sub { font-size: var(--p-font-size-275); color: var(--p-color-text-secondary); display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  &__card-group-tag { font-weight: var(--p-font-weight-semibold); font-size: var(--p-font-size-275); }
  &__card-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--p-color-text-disabled); flex-shrink: 0; }
  &__card-dot-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--p-color-text-disabled); flex-shrink: 0; }

  &__card-mult {
    font-size: var(--p-font-size-350); font-weight: var(--p-font-weight-bold);
    color: var(--p-color-text-success); white-space: nowrap; flex-shrink: 0;
    strong { font-weight: var(--p-font-weight-bold); }
  }

  &__card-edit {
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    background: none; border: none; border-radius: var(--p-border-radius-100);
    color: var(--p-color-icon); cursor: pointer; opacity: 0; transition: opacity 0.1s;
    flex-shrink: 0;
    &:hover { background: var(--p-color-bg-fill-transparent-hover); }
  }

  &__card-connect {
    position: absolute; right: -15px; top: 50%; transform: translateY(-50%);
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--p-color-bg-fill-brand); color: #fff;
    border: 3px solid #F8FAFC; display: flex; align-items: center; justify-content: center;
    cursor: pointer; opacity: 0; z-index: 5; box-shadow: var(--p-shadow-button);
    transition: opacity 0.1s, background 0.1s, transform 0.1s;
    &:hover { background: var(--p-color-bg-fill-brand-hover); transform: translateY(-50%) scale(1.1); }
  }

  &__link-btn { @include polaris-button-plain; font-size: var(--p-font-size-275); white-space: nowrap; padding: 2px 6px; min-height: auto; }

  // ─── Divider ───
  &__divider {
    display: flex; align-items: center; gap: var(--p-space-200);
    padding: var(--p-space-200) 0;
    span { font-size: 10px; font-weight: var(--p-font-weight-semibold); color: var(--p-color-text-disabled); text-transform: uppercase; letter-spacing: 1px; }
    &::after { content: ''; flex: 1; height: 1px; background: var(--p-color-border); }
  }

  // ─── Unlinked group label ───
  &__unlinked-label {
    display: flex; align-items: center; gap: var(--p-space-200);
    padding: var(--p-space-050) 0;
    font-size: var(--p-font-size-300); font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text-secondary);
  }

  &__unlinked-icon {
    width: 20px; height: 20px; min-width: 20px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
  }

  // ─── Common ───
  &__loading { display: flex; justify-content: center; padding: var(--p-space-1200) 0; }
  &__spinner { @include polaris-spinner; }
  &__empty { @include polaris-text-description; text-align: center; padding: var(--p-space-1000) var(--p-space-400); border: 2px dashed var(--p-color-border); border-radius: var(--p-border-radius-200); color: var(--p-color-text-disabled); }
}

.slide-enter-active, .slide-leave-active { transition: transform var(--p-motion-duration-300) var(--p-motion-ease); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
