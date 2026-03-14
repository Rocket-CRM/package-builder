<template>
  <div class="es" ref="rootRef">
    <div class="es__layout" ref="layoutRef">
      <!-- Column headers -->
      <div class="es__header-row">
        <div class="es__col-head es__col-head--left">
          <h2 class="es__title">Earn factor group</h2>
          <button class="es__primary-btn" @click="openCreateFactorGroup">Create</button>
        </div>
        <div class="es__col-head es__col-head--right">
          <h2 class="es__title">Earn Conditions group</h2>
          <button class="es__primary-btn" @click="openCreateConditionGroup">Create</button>
        </div>
      </div>

      <div v-if="loadingFactorGroups" class="es__loading"><div class="es__spinner"></div></div>

      <template v-else>
        <!-- ═══ LINKED GROUPS (top) ═══ -->
        <div v-for="entry in linkedGroupEntries" :key="entry.group.id" class="es__group-row">
          <div class="es__group-left">
            <div class="es__group-sidebar" :style="sidebarStyle(entry.group.id)">
              <div class="es__sidebar-accent" :style="{ background: getGroupColor(entry.group.id) }"></div>
              <div class="es__sidebar-inner">
                <span class="es__sidebar-name">{{ entry.group.name || 'Untitled Group' }}</span>
                <button class="es__sidebar-action" @click="handleAddFactor(entry.group.id)" title="Add earn factor">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="es__sidebar-action" @click="handleEditFactorGroup()" title="Edit group">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                </button>
              </div>
            </div>
            <div class="es__group-cards">
              <div v-for="f in entry.factors" :key="f.id"
                :data-factor-id="f.id"
                class="es__card es__card--factor">
                <div class="es__card-accent" :style="{ background: getGroupColor(f.earn_factor_group_id) }"></div>
                <div class="es__card-body">
                  <div class="es__card-icon" :class="f.target_currency === 'ticket' ? 'es__card-icon--credit' : 'es__card-icon--points'">
                    <svg v-if="f.earn_factor_type === 'rate'" width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 3h6l8 8-6 6-8-8V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" fill="currentColor"/></svg>
                  </div>
                  <div class="es__card-info">
                    <div class="es__card-name">{{ getFactorTitle(f) }}</div>
                    <div class="es__card-sub"><span>{{ getFactorType(f) }}</span></div>
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
            </div>
          </div>
          <div class="es__group-right">
            <div class="es__cond-slots">
              <div v-for="f in entry.factors" :key="f.id" class="es__cond-slot">
                <div v-if="f._condGroupInfo"
                  :data-cg-key="f._dk"
                  class="es__card es__card--condition"
                  :class="{ 'es__card--expanded': expandedConds[f._dk] }">
                  <div class="es__card-dot-indicator"></div>
                  <div class="es__cond-wrap">
                    <div class="es__cond-header" @click="handleEditConditionGroup(f._condGroupInfo.group)">
                      <div class="es__cg-icon" :style="cgIconStyle(f._condGroupInfo.group?.id)">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 10h6M10 7v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                      </div>
                      <div class="es__card-info">
                        <div class="es__card-name">{{ f._condGroupInfo.group?.name || 'Untitled' }}</div>
                        <div class="es__card-sub">
                          <span>{{ f._condGroupInfo.conditions?.length || 0 }} condition{{ (f._condGroupInfo.conditions?.length || 0) !== 1 ? 's' : '' }}</span>
                          <template v-if="f._condGroupInfo.linkedCount > 0">
                            <span class="es__card-dot-sep"></span>
                            <span>{{ f._condGroupInfo.linkedCount }} linked</span>
                          </template>
                        </div>
                      </div>
                      <button class="es__expand-btn" @click.stop="toggleCondExpand(f._dk)"
                        :class="{ 'es__expand-btn--open': expandedConds[f._dk] }">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M6 12.5l4-5 4 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </div>
                    <div v-if="expandedConds[f._dk] && f._condGroupInfo.conditions?.length" class="es__cond-detail">
                      <table class="es__cond-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Items</th>
                            <th>Logic</th>
                            <th>Threshold type</th>
                            <th>Excess</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cond, ci) in f._condGroupInfo.conditions" :key="ci">
                            <td>{{ formatEntity(cond?.entity) }}</td>
                            <td><span class="es__items-badge">{{ cond?.entity_ids?.length || 0 }}</span></td>
                            <td>{{ cond?.operator || '-' }}</td>
                            <td>{{ formatThreshold(cond?.threshold_unit) }}</td>
                            <td>{{ cond?.apply_to_excess_only ? 'Yes' : 'No' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ UNLINKED SECTION ═══ -->
        <template v-if="hasUnlinkedSection">
          <div class="es__divider"><span>Unlinked</span></div>
          <div class="es__unlinked-row">
            <div class="es__unlinked-left">
              <div v-for="entry in unlinkedGroupsWithFactors" :key="entry.group.id" class="es__unlinked-group">
                <div class="es__group-sidebar" :style="sidebarStyle(entry.group.id)">
                  <div class="es__sidebar-accent" :style="{ background: getGroupColor(entry.group.id) }"></div>
                  <div class="es__sidebar-inner">
                    <span class="es__sidebar-name">{{ entry.group.name || 'Untitled Group' }}</span>
                    <button class="es__sidebar-action" @click="handleAddFactor(entry.group.id)" title="Add earn factor">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                    </button>
                    <button class="es__sidebar-action" @click="handleEditFactorGroup()" title="Edit group">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                    </button>
                  </div>
                </div>
                <div class="es__group-cards">
                  <div v-for="f in entry.factors" :key="f.id"
                    :data-factor-id="f.id"
                    class="es__card es__card--factor es__card--dim">
                    <div class="es__card-accent" :style="{ background: getGroupColor(f.earn_factor_group_id) }"></div>
                    <div class="es__card-body">
                      <div class="es__card-icon" :class="f.target_currency === 'ticket' ? 'es__card-icon--credit' : 'es__card-icon--points'">
                        <svg v-if="f.earn_factor_type === 'rate'" width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 3h6l8 8-6 6-8-8V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" fill="currentColor"/></svg>
                      </div>
                      <div class="es__card-info">
                        <div class="es__card-name">{{ getFactorTitle(f) }}</div>
                        <div class="es__card-sub"><span>{{ getFactorType(f) }}</span></div>
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
                </div>
              </div>

              <div v-for="entry in emptyGroups" :key="entry.group.id" class="es__unlinked-group es__unlinked-group--empty">
                <div class="es__group-sidebar" :style="sidebarStyle(entry.group.id)">
                  <div class="es__sidebar-accent" :style="{ background: getGroupColor(entry.group.id) }"></div>
                  <div class="es__sidebar-inner">
                    <span class="es__sidebar-name">{{ entry.group.name || 'Untitled Group' }}</span>
                    <button class="es__sidebar-action" @click="handleAddFactor(entry.group.id)" title="Add earn factor">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                    </button>
                    <button class="es__sidebar-action" @click="handleEditFactorGroup()" title="Edit group">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="es__unlinked-right" v-if="unlinkedCondGroups.length">
              <div v-for="cg in unlinkedCondGroups" :key="cg.id" class="es__cond-slot">
                <div class="es__card es__card--condition es__card--dim"
                  :class="{ 'es__card--expanded': expandedConds[cg.id] }"
                  :data-cg-key="cg.id">
                  <div class="es__card-dot-indicator"></div>
                  <div class="es__cond-wrap">
                    <div class="es__cond-header" @click="handleEditConditionGroup(cg)">
                      <div class="es__cg-icon" :style="cgIconStyle(cg?.id)">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 10h6M10 7v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                      </div>
                      <div class="es__card-info">
                        <div class="es__card-name">{{ cg?.name || 'Untitled' }}</div>
                        <div class="es__card-sub">
                          <span>{{ cg._conditions?.length || 0 }} condition{{ (cg._conditions?.length || 0) !== 1 ? 's' : '' }}</span>
                        </div>
                      </div>
                      <button class="es__expand-btn" @click.stop="toggleCondExpand(cg.id)"
                        :class="{ 'es__expand-btn--open': expandedConds[cg.id] }">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M6 12.5l4-5 4 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </div>
                    <div v-if="expandedConds[cg.id] && cg._conditions?.length" class="es__cond-detail">
                      <table class="es__cond-table">
                        <thead>
                          <tr><th>Type</th><th>Items</th><th>Logic</th><th>Threshold type</th><th>Excess</th></tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cond, ci) in cg._conditions" :key="ci">
                            <td>{{ formatEntity(cond?.entity) }}</td>
                            <td><span class="es__items-badge">{{ cond?.entity_ids?.length || 0 }}</span></td>
                            <td>{{ cond?.operator || '-' }}</td>
                            <td>{{ formatThreshold(cond?.threshold_unit) }}</td>
                            <td>{{ cond?.apply_to_excess_only ? 'Yes' : 'No' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="!factorGroups?.length" class="es__empty">No earn factor groups yet.</div>
      </template>

      <!-- SVG CONNECTIONS -->
      <svg class="es__svg" ref="svgRef">
        <path v-for="ln in lines" :key="ln.key" :d="ln.d" fill="none"
          :stroke="hoveredLine === ln.key ? '#0262E0' : '#CCCCCC'"
          :stroke-width="hoveredLine === ln.key ? 2.5 : 1.5"
          @mouseenter="hoveredLine = ln.key" @mouseleave="hoveredLine = null" style="cursor:pointer" />
      </svg>
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
const ENTITY_LABELS = { product_product: 'Product', product_sku: 'SKU', product_brand: 'Brand', product_category: 'Category', store: 'Store', store_attribute_set: 'Store Attr', tier: 'Tier', persona: 'Persona' };
const THRESHOLD_LABELS = { purchase_amount: 'Purchase amount', purchase_quantity: 'Purchase qty', purchase_count: 'Purchase count' };

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
    const panel = ref(null);
    const editingFactor = ref(null);
    const editingGroupId = ref(null);
    const editingCondGroup = ref(null);
    const showModal = ref(false);
    const modalType = ref('factor');
    const hoveredLine = ref(null);
    const connectPopup = ref({ open: false, pos: null, factorId: null, groupId: null });
    const lines = ref([]);
    const expandedConds = ref({});
    let lineTimer = null, ro = null;

    const groupNameMap = computed(() => {
      const m = {};
      for (const g of factorGroups.value || []) { if (g?.id) m[g.id] = g.name || 'Untitled Group'; }
      return m;
    });

    function getGroupColor(gid) { return GROUP_COLORS[hashStr(gid) % GROUP_COLORS.length]; }
    function getGroupName(gid) { return groupNameMap.value[gid] || 'Unknown Group'; }
    function cgIconStyle(gid) { const c = getGroupColor(gid); return { background: `${c}12`, color: c }; }
    function sidebarStyle(gid) { const c = getGroupColor(gid); return { background: `${c}06` }; }
    function formatEntity(e) { return ENTITY_LABELS[e] || e?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || '-'; }
    function formatThreshold(u) { return THRESHOLD_LABELS[u] || u?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || '-'; }

    function toggleCondExpand(dk) {
      expandedConds.value = { ...expandedConds.value, [dk]: !expandedConds.value[dk] };
      scheduleLineUpdate();
      setTimeout(scheduleLineUpdate, 300);
    }

    const groupedEntries = computed(() => {
      const condGroups = allCondGroups.value || [];
      const allF = Object.values(factorsByGroup.value || {}).flat();

      return (factorGroups.value || []).filter(g => g?.id).map(g => ({
        group: g,
        factors: (factorsByGroup.value[g.id] || []).map(f => {
          const cid = f?.earn_conditions_group_id;
          let _condGroupInfo = null;
          if (cid) {
            const cg = condGroups.find(x => x?.id === cid);
            if (cg) {
              _condGroupInfo = {
                group: cg,
                conditions: condCache.value[cid]?.conditions || cg?.conditions || [],
                linkedCount: allF.filter(x => x?.earn_conditions_group_id === cid).length,
              };
            }
          }
          return { ...f, _condGroupInfo, _dk: cid ? `${cid}__${f.id}` : null };
        }),
      }));
    });

    const linkedGroupEntries = computed(() =>
      groupedEntries.value.filter(e => e.factors.some(f => f._condGroupInfo))
    );
    const unlinkedGroupsWithFactors = computed(() =>
      groupedEntries.value.filter(e => e.factors.length > 0 && !e.factors.some(f => f._condGroupInfo))
    );
    const emptyGroups = computed(() =>
      groupedEntries.value.filter(e => e.factors.length === 0)
    );
    const hasUnlinkedSection = computed(() =>
      unlinkedGroupsWithFactors.value.length > 0 || emptyGroups.value.length > 0 || unlinkedCondGroups.value.length > 0
    );
    const unlinkedCondGroups = computed(() => {
      const allF = Object.values(factorsByGroup.value || {}).flat();
      const linked = new Set(allF.map(f => f?.earn_conditions_group_id).filter(Boolean));
      return (allCondGroups.value || []).filter(g => g?.id && !linked.has(g.id)).map(g => ({
        ...g,
        _conditions: condCache.value[g.id]?.conditions || g?.conditions || [],
      }));
    });

    async function loadAll() {
      await Promise.all([loadFactorGroups(), loadCondGroups(), loadEntities()]);
      emit('trigger-event', { name: 'data-loaded', event: { factorGroupCount: factorGroups.value?.length, conditionGroupCount: allCondGroups.value?.length } });
      scheduleLineUpdate();
      setTimeout(scheduleLineUpdate, 300);
      setTimeout(scheduleLineUpdate, 800);
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

    function scheduleLineUpdate() {
      clearTimeout(lineTimer);
      lineTimer = setTimeout(() => nextTick(rebuildLines), 150);
    }

    function rebuildLines() {
      const root = rootRef.value;
      if (!root) return;
      const layout = layoutRef.value;
      if (!layout) return;
      const lr = layout.getBoundingClientRect();
      const newLines = [];

      for (const entry of linkedGroupEntries.value) {
        for (const f of entry.factors) {
          if (!f._dk) continue;
          const doc = typeof wwLib !== 'undefined' ? wwLib.getFrontDocument() : document;
          const fEl = root.querySelector(`[data-factor-id="${f.id}"]`) || doc.querySelector(`[data-factor-id="${f.id}"]`);
          const cEl = root.querySelector(`[data-cg-key="${f._dk}"]`) || doc.querySelector(`[data-cg-key="${f._dk}"]`);
          if (!fEl || !cEl) continue;

          const fR = fEl.getBoundingClientRect();
          const cR = cEl.getBoundingClientRect();
          const x1 = fR.right - lr.left;
          const y1 = fR.top + fR.height / 2 - lr.top;
          const x2 = cR.left - lr.left;
          const y2 = cR.top + 30 - lr.top;
          if (x2 <= x1) continue;

          const cp = Math.max((x2 - x1) * 0.4, 40);
          const d = `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
          newLines.push({ key: `${f.id}__${f.earn_conditions_group_id}`, d });
        }
      }

      lines.value = newLines;
    }

    function getFactorTitle(f) { if (!f) return 'Unnamed'; if (f.name || f.target_entity_name) return f.name || f.target_entity_name; const c = f.target_currency === 'ticket' ? 'Credit' : 'Points'; return f.earn_factor_type === 'rate' ? `${c} Starter Rules` : `${c} Power Boost`; }
    function getFactorType(f) { if (!f) return ''; const c = f.target_currency === 'ticket' ? 'Store credit' : 'Points'; return `${c} (${f.earn_factor_type === 'rate' ? 'Base rate' : 'Multiplier'})`; }

    function handleAddFactor(groupId) { editingFactor.value = { earn_factor_type: 'rate', public: true, target_currency: 'points', active_status: true }; editingGroupId.value = groupId; panel.value = 'factor'; }
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
      factorGroups, allCondGroups, entityOptions, ticketTypes,
      loadingFactorGroups, loadingConditionGroups, expandedConds,
      panel, editingFactor, editingGroupId, editingCondGroup,
      showModal, modalType, hoveredLine, connectPopup,
      linkedGroupEntries, unlinkedGroupsWithFactors, emptyGroups,
      hasUnlinkedSection, unlinkedCondGroups, lines,
      getGroupColor, getGroupName, cgIconStyle, sidebarStyle,
      getFactorTitle, getFactorType, formatEntity, formatThreshold,
      toggleCondExpand,
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
$sidebar-width: 140px;
$left-width: 520px;
$right-width: 480px;

.es {
  @include polaris-tokens;
  font-family: var(--p-font-family-sans);
  color: var(--p-color-text);
  background: #F8FAFC;
  width: 100%; height: 100%; overflow: auto;
  padding: 0 var(--p-space-600) 64px;

  &__layout { display: flex; flex-direction: column; position: relative; }
  &__header-row { display: flex; justify-content: space-between; }
  &__col-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--p-space-600) 0 var(--p-space-400);
    &--left { width: $left-width; flex-shrink: 0; }
    &--right { width: $right-width; flex-shrink: 0; }
  }
  &__title { @include polaris-text-title; margin: 0; }
  &__primary-btn { @include polaris-button-primary; @include polaris-button-slim; font-size: var(--p-font-size-300); }

  &__group-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: var(--p-space-500);
  }

  &__group-left {
    width: $left-width; flex-shrink: 0; z-index: 2;
    display: flex; align-items: stretch; gap: 10px;
  }

  // ─── Group sidebar (no icon, just name + action icons) ───
  &__group-sidebar {
    width: $sidebar-width; flex-shrink: 0;
    min-height: $card-height;
    display: flex; align-items: stretch;
    border: 1px solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    overflow: hidden;
  }
  &__sidebar-accent {
    width: 4px; min-width: 4px;
  }
  &__sidebar-inner {
    flex: 1;
    padding: 0 8px 0 10px;
    display: flex; align-items: center; gap: 6px;
    align-self: flex-start;
    min-height: $card-height;
  }
  &__sidebar-name {
    flex: 1; min-width: 0;
    font-size: 12px; line-height: 1.3;
    font-weight: var(--p-font-weight-semibold);
    color: var(--p-color-text);
    overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sidebar-action {
    width: 22px; height: 22px; min-width: 22px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; border-radius: var(--p-border-radius-100);
    color: var(--p-color-icon); cursor: pointer; flex-shrink: 0;
    opacity: 0.5; transition: opacity 0.1s, background 0.1s;
    &:hover { opacity: 1; background: var(--p-color-bg-fill-transparent-hover); }
  }

  &__group-cards {
    flex: 1; display: flex; flex-direction: column;
    gap: var(--p-space-200); min-width: 0;
  }

  &__group-right { width: $right-width; flex-shrink: 0; z-index: 2; }
  &__cond-slots { display: flex; flex-direction: column; gap: var(--p-space-200); }
  &__cond-slot { min-height: $card-height; display: flex; align-items: flex-start; }

  &__svg {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 1; pointer-events: none; overflow: visible;
    path { pointer-events: stroke; }
  }

  // ═══ UNLINKED ═══
  &__unlinked-row { display: flex; justify-content: space-between; align-items: flex-start; }
  &__unlinked-left { width: $left-width; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
  &__unlinked-group {
    display: flex; align-items: stretch; gap: 10px;
    opacity: 0.7; transition: opacity 0.15s;
    &:hover { opacity: 1; }
    &--empty { opacity: 0.5; }
  }
  &__unlinked-right { width: $right-width; flex-shrink: 0; display: flex; flex-direction: column; gap: var(--p-space-200); }

  // ─── Unified card ───
  &__card {
    position: relative;
    display: flex; align-items: stretch;
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
    &--condition { padding-left: var(--p-space-400); width: 100%; cursor: pointer; }
    &--dim { opacity: 0.6; border-color: var(--p-color-border); &:hover { opacity: 1; } }
    &--expanded { height: auto; border-color: var(--p-color-border-info); box-shadow: var(--p-shadow-card-sm); }
  }
  &__card-accent {
    width: 4px; min-width: 4px;
    border-radius: var(--p-border-radius-200) 0 0 var(--p-border-radius-200);
  }
  &__card-dot-indicator {
    position: absolute; left: -7px; top: 30px; transform: translateY(-50%);
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
  &__card-dot-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--p-color-text-disabled); flex-shrink: 0; }
  &__card-mult {
    font-size: var(--p-font-size-350); font-weight: var(--p-font-weight-bold);
    color: var(--p-color-text-success); white-space: nowrap; flex-shrink: 0;
  }
  &__card-edit {
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    background: none; border: none; border-radius: var(--p-border-radius-100);
    color: var(--p-color-icon); cursor: pointer; opacity: 0; transition: opacity 0.1s;
    flex-shrink: 0;
    &:hover { background: var(--p-color-bg-fill-transparent-hover); }
    &--visible { opacity: 1; }
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

  // ─── Condition expand ───
  &__cond-wrap {
    flex: 1; display: flex; flex-direction: column; min-width: 0;
  }
  &__cond-header {
    height: 58px; display: flex; align-items: center;
    gap: var(--p-space-200); padding: 0 var(--p-space-300);
    min-width: 0; cursor: pointer;
  }
  &__expand-btn {
    width: 28px; height: 28px; min-width: 28px;
    display: flex; align-items: center; justify-content: center;
    background: var(--p-color-bg-surface); border: 1px solid var(--p-color-border);
    border-radius: 8px; cursor: pointer; flex-shrink: 0;
    color: var(--p-color-icon); transition: transform 0.2s, background 0.1s;
    svg { transform: rotate(180deg); transition: transform 0.2s; }
    &--open svg { transform: rotate(0deg); }
    &:hover { background: var(--p-color-bg-fill-transparent-hover); }
  }

  &__cond-detail {
    border-top: 1px solid var(--p-color-border);
    padding: 0;
  }

  &__cond-table {
    width: 100%; border-collapse: collapse;
    font-size: 13px;

    th {
      text-align: center; padding: 8px 10px;
      font-weight: var(--p-font-weight-medium);
      color: var(--p-color-text-secondary);
      font-size: 12px; background: var(--p-color-bg-surface-secondary);
      border-bottom: 1px solid var(--p-color-border);
    }
    td {
      text-align: center; padding: 10px;
      border-bottom: 1px solid var(--p-color-border);
      color: var(--p-color-text);
    }
    tr:last-child td { border-bottom: none; }
  }

  &__items-badge {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 8px; border-radius: 10px;
    background: #FDE8E8; color: #D82C0D;
    font-size: 12px; font-weight: var(--p-font-weight-semibold);
  }

  // ─── Divider ───
  &__divider {
    display: flex; align-items: center; gap: var(--p-space-200);
    padding: var(--p-space-300) 0;
    span { font-size: 10px; font-weight: var(--p-font-weight-semibold); color: var(--p-color-text-disabled); text-transform: uppercase; letter-spacing: 1px; }
    &::after { content: ''; flex: 1; height: 1px; background: var(--p-color-border); }
  }

  &__loading { display: flex; justify-content: center; padding: var(--p-space-1200) 0; }
  &__spinner { @include polaris-spinner; }
  &__empty { @include polaris-text-description; text-align: center; padding: var(--p-space-1000) var(--p-space-400); border: 2px dashed var(--p-color-border); border-radius: var(--p-border-radius-200); color: var(--p-color-text-disabled); }
}

.slide-enter-active, .slide-leave-active { transition: transform var(--p-motion-duration-300) var(--p-motion-ease); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
