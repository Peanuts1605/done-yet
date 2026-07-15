import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Braces, Check, CheckCircle2, CircleAlert,
  CircleMinus, Clipboard, Download, FileJson, Headphones, ReceiptText,
  RotateCcw, SearchCheck, ShieldCheck, WalletCards, X, XCircle,
} from 'lucide-react'
import './App.css'

const statusIcon = { PASS: CheckCircle2, FAIL: XCircle, HOLD: CircleMinus }

function shortDigest(value) {
  return value ? `${value.slice(0, 14)}…${value.slice(-8)}` : 'Not captured'
}

function sentenceCase(value) {
  return value.replaceAll('-', ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function StatusMark({ status, size = 18 }) {
  const Icon = statusIcon[status] ?? CircleAlert
  return <Icon size={size} aria-hidden="true" />
}

function AppHeader({ onExport }) {
  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="wordmark" aria-label="Done Yet?">Done Yet?</div>
        <div className="header-divider" />
        <div className="fixture-switcher" title="Current demo fixture">Refund workflow</div>
        <span className="provenance"><Braces size={15} aria-hidden="true" /> Codex + GPT-5.6</span>
      </div>
      <button className="button secondary" type="button" onClick={onExport}>
        <Download size={17} aria-hidden="true" /> Export
      </button>
    </header>
  )
}

function ScenarioRail({ scenarios, selectedId, onSelect }) {
  return (
    <nav className="scenario-rail" aria-label="Verification scenarios">
      <div className="rail-heading"><span>Scenarios</span><span>{scenarios.length}</span></div>
      <div className="scenario-list">
        {scenarios.map((scenario, index) => (
          <button
            className={`scenario-row ${scenario.report.verdict.toLowerCase()} ${selectedId === scenario.id ? 'selected' : ''}`}
            type="button"
            key={scenario.id}
            aria-current={selectedId === scenario.id ? 'true' : undefined}
            onClick={() => onSelect(scenario.id)}
          >
            <StatusMark status={scenario.report.verdict} size={22} />
            <span className="scenario-index">{index + 1}</span>
            <span className="scenario-copy"><strong>{scenario.name}</strong><small>{scenario.short}</small></span>
            <span className="scenario-verdict">{scenario.report.verdict}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

function VerdictHeader({ report }) {
  const copy = report.verdict === 'PASS'
    ? 'Observed state supports the outcome'
    : report.verdict === 'FAIL'
      ? 'State disagrees with the claim'
      : 'A required probe is unavailable'
  return (
    <div className={`verdict-header ${report.verdict.toLowerCase()}`}>
      <div className="verdict-title">
        <StatusMark status={report.verdict} size={26} />
        <h1>{report.verdict} <span>— {copy}</span></h1>
      </div>
      <div className="check-tally"><strong>{report.summary.passed}/{report.summary.total}</strong> checks passed</div>
    </div>
  )
}

function ClaimQuote({ claim }) {
  return (
    <section className="claim-section" aria-labelledby="claim-heading">
      <h2 id="claim-heading">The agent said done.</h2>
      <blockquote><span aria-hidden="true">“</span><p>{claim}</p></blockquote>
    </section>
  )
}

function EntityPanel({ kind, entity, state }) {
  const isTicket = kind === 'Helpdesk'
  const Icon = isTicket ? Headphones : WalletCards
  const rows = isTicket
    ? [['Ticket', entity?.id ?? 'TKT-17'], ['Order', entity?.orderId ?? '—'], ['Status', entity?.status ?? 'Missing'], ['Verified', entity?.identityVerified ? 'Yes' : 'No'], ['Refund link', entity?.refundId ?? 'None']]
    : [['Refund', entity?.id ?? 'Missing'], ['Order', entity?.orderId ?? '—'], ['Amount', entity?.amount != null ? `$${entity.amount}.00` : '—'], ['Status', entity?.status ?? 'Not posted']]
  return (
    <section className="entity-panel">
      <div className="entity-heading"><Icon size={18} aria-hidden="true" /> {kind}</div>
      <div className="entity-body">
        {rows.map(([label, value]) => <div className="entity-row" key={label}><span>{label}</span><strong className={label === 'Status' ? state : ''}>{value}</strong></div>)}
      </div>
    </section>
  )
}

function OutcomeFlow({ scenario }) {
  const ticket = scenario.after.helpdesk?.tickets?.['TKT-17']
  const refund = scenario.after.ledger?.refunds?.['REF-17']
  const isPass = scenario.report.verdict === 'PASS'
  return (
    <section className={`outcome-flow ${isPass ? 'pass' : 'fail'}`} aria-label="Observed relationship between systems">
      <EntityPanel kind="Helpdesk" entity={ticket} state={ticket?.status === 'closed' ? 'good' : 'bad'} />
      <div className="relationship">
        <div className="relationship-line" />
        <div className="relationship-mark">{isPass ? <Check size={20} aria-hidden="true" /> : <X size={20} aria-hidden="true" />}</div>
        <p>{scenario.insight}</p>
      </div>
      <EntityPanel kind="Refund ledger" entity={refund} state={refund ? 'good' : 'bad'} />
    </section>
  )
}

function stateRows(state) {
  const ticket = state.helpdesk?.tickets?.['TKT-17']
  const refund = state.ledger?.refunds?.['REF-17']
  const order = state.orders?.['ORD-17']
  const unrelated = state.orders?.['ORD-99']
  return [
    { system: 'Helpdesk', entity: 'Ticket', key: 'TKT-17', value: ticket?.status ?? 'Missing' },
    { system: 'Refund ledger', entity: 'Refund', key: 'REF-17', value: refund?.status ?? '—' },
    { system: 'Orders', entity: 'Order', key: 'ORD-17', value: order?.status ?? 'Missing' },
    { system: 'Orders', entity: 'Unrelated', key: 'ORD-99', value: unrelated?.status ?? 'Missing' },
  ]
}

function StateTable({ title, state, compareState }) {
  const rows = stateRows(state)
  const comparison = compareState ? stateRows(compareState) : null
  return (
    <section className="state-table">
      <h3>{title} <span>(observed)</span></h3>
      <div className="table-wrap"><table>
        <thead><tr><th>System</th><th>Entity</th><th>Key</th><th>State</th></tr></thead>
        <tbody>{rows.map((row, index) => {
          const changed = comparison && comparison[index]?.value !== row.value
          return <tr key={`${row.system}-${row.key}`}><td>{row.system}</td><td>{row.entity}</td><td>{row.key}</td><td className={changed ? 'changed' : ''}>{sentenceCase(row.value)}</td></tr>
        })}</tbody>
      </table></div>
    </section>
  )
}

function StateComparison({ scenario }) {
  return <div className="state-comparison"><StateTable title="Before state" state={scenario.before} /><ArrowRight className="state-arrow" size={22} aria-hidden="true" /><StateTable title="After state" state={scenario.after} compareState={scenario.before} /></div>
}

function ContractPanel({ report, filter, onFilter, onOpenContract }) {
  const checks = filter === 'failed' ? report.checks.filter((check) => check.status !== 'PASS') : report.checks
  return (
    <aside className="contract-panel">
      <div className="inspector-heading"><div><SearchCheck size={18} aria-hidden="true" /><h2>Acceptance contract</h2></div><button type="button" className="icon-button" title="View full contract" onClick={onOpenContract}><ReceiptText size={18} /></button></div>
      <div className="segmented" role="group" aria-label="Filter contract checks">
        <button className={filter === 'all' ? 'active' : ''} type="button" onClick={() => onFilter('all')}>All ({report.summary.total})</button>
        <button className={filter === 'failed' ? 'active' : ''} type="button" onClick={() => onFilter('failed')}>Failed only ({report.summary.failed + report.summary.held})</button>
      </div>
      <div className="check-list">
        {checks.length ? checks.map((check) => <div className={`check-row ${check.status.toLowerCase()}`} key={check.id}><StatusMark status={check.status} size={18} /><div><strong>{check.label ?? check.id}</strong><small>{check.assertion === 'retry' ? 'Retry comparison' : check.assertion}</small></div></div>) : <div className="empty-filter"><ShieldCheck size={22} /><span>No failed checks</span></div>}
      </div>
      <div className="inspector-summary"><span>{report.summary.failed} failed</span><span>{report.summary.held} on hold</span><span>{report.summary.passed} passed</span></div>
    </aside>
  )
}

function EvidenceStrip({ report, onOpenResult, onOpenContract }) {
  return (
    <section className="evidence-strip" aria-label="Evidence digests">
      <div className="evidence-cell"><span>Contract digest</span><strong>{shortDigest(report.observed.contractDigest)}</strong><button type="button" onClick={onOpenContract}>View contract</button></div>
      <div className="evidence-cell"><span>Before digest</span><strong>{shortDigest(report.observed.beforeDigest)}</strong><small>Canonical fixture</small></div>
      <div className="evidence-cell"><span>After digest</span><strong>{shortDigest(report.observed.afterDigest)}</strong><small>Canonical fixture</small></div>
      <div className="evidence-cell generated"><span>Generated</span><strong>{new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong><small>Local deterministic check</small></div>
      <button className="button result-button" type="button" onClick={onOpenResult}><FileJson size={18} /> Open result JSON</button>
    </section>
  )
}

function ProgressStrip({ verdict }) {
  const steps = [['Intent interpreted', Clipboard], ['State observed', SearchCheck], ['Verdict issued', verdict === 'PASS' ? Check : X]]
  return <footer className={`progress-strip ${verdict.toLowerCase()}`}>{steps.map(([label, Icon], index) => <div className="progress-step" key={label}><div className="progress-icon"><Icon size={17} aria-hidden="true" /></div><div><span>{index + 1}</span><strong>{label}</strong></div></div>)}</footer>
}

function DataDialog({ title, data, onClose }) {
  const [copied, setCopied] = useState(false)
  const text = JSON.stringify(data, null, 2)
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="data-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header><div><FileJson size={19} /><h2 id="dialog-title">{title}</h2></div><button className="icon-button" type="button" title="Close" onClick={onClose}><X size={20} /></button></header>
        <pre>{text}</pre>
        <footer><span>Readable evidence, not a claim of independent truth.</span><button className="button secondary" type="button" onClick={copy}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Copied' : 'Copy JSON'}</button></footer>
      </section>
    </div>
  )
}

function LoadingState() {
  return <main className="loading"><RotateCcw className="spin" size={22} /><span>Reading observed state…</span></main>
}

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState('partial-commit')
  const [filter, setFilter] = useState('all')
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    fetch('/data/demo.json').then((response) => {
      if (!response.ok) throw new Error('Demo evidence could not be loaded')
      return response.json()
    }).then(setData).catch((loadError) => setError(loadError.message))
  }, [])

  const scenario = useMemo(() => data?.scenarios.find((item) => item.id === selectedId) ?? data?.scenarios[0], [data, selectedId])
  useEffect(() => setFilter('all'), [selectedId])

  function downloadReport() {
    const blob = new Blob([JSON.stringify(scenario.report, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `done-yet-${scenario.id}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (error) return <main className="loading error"><CircleAlert size={22} /><span>{error}</span></main>
  if (!scenario) return <LoadingState />

  return (
    <div className="app-shell">
      <AppHeader onExport={downloadReport} />
      <div className="workspace">
        <ScenarioRail scenarios={data.scenarios} selectedId={scenario.id} onSelect={setSelectedId} />
        <main className="outcome-canvas"><VerdictHeader report={scenario.report} /><ClaimQuote claim={scenario.claim} /><OutcomeFlow scenario={scenario} /><StateComparison scenario={scenario} /></main>
        <ContractPanel report={scenario.report} filter={filter} onFilter={setFilter} onOpenContract={() => setDialog('contract')} />
      </div>
      <EvidenceStrip report={scenario.report} onOpenResult={() => setDialog('result')} onOpenContract={() => setDialog('contract')} />
      <ProgressStrip verdict={scenario.report.verdict} />
      {dialog && <DataDialog title={dialog === 'contract' ? 'Acceptance contract' : `${scenario.name} result`} data={dialog === 'contract' ? data.contract : scenario.report} onClose={() => setDialog(null)} />}
    </div>
  )
}

export default App
