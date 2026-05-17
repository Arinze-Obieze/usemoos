const integrations = [
  { bg: '#4A154B', label: '#', name: 'Slack' },
  { bg: '#0F1108', label: 'N', name: 'Notion' },
  { bg: '#1FA463', label: 'D', name: 'Drive' },
  { bg: '#161B22', label: 'G', name: 'GitHub' },
  { bg: '#0052CC', label: 'J', name: 'Jira' },
  { bg: '#172B4D', label: 'C', name: 'Confluence' },
  { bg: '#5E6AD2', label: 'L', name: 'Linear' },
  { bg: '#FF7A59', label: 'H', name: 'HubSpot' },
  { bg: '#00A1E0', label: 'S', name: 'Salesforce' },
  { bg: '#03363D', label: 'Z', name: 'Zendesk' },
  { bg: '#4B53BC', label: 'T', name: 'Teams' },
  { bg: '#0061FF', label: 'D', name: 'Dropbox' },
  { bg: '#0F1108', label: 'S', name: 'SharePoint' },
  { bg: '#026AA7', label: 'T', name: 'Trello' },
  { bg: '#F06A6A', label: 'A', name: 'Asana' },
]

export default function Integrations() {
  return (
    <section className="int-section sec" id="integrations">
      <div className="wrap">
        <div className="sec-head centered">
          <div className="sec-tag">Integrations</div>
          <h2 className="sec-title">Connect once. <em>Everything&apos;s in scope</em>.</h2>
          <p className="sec-sub">Native, two-way integrations with the systems your team already trusts. New connectors ship every month based on customer demand.</p>
        </div>
        <div className="int-grid">
          {integrations.map((int, i) => (
            <div key={i} className="int">
              <div className="int-ico" style={{ background: int.bg }}>{int.label}</div>
              <div className="nm">{int.name}</div>
            </div>
          ))}
          <div className="int more">+ 18 more</div>
        </div>
      </div>
    </section>
  )
}
