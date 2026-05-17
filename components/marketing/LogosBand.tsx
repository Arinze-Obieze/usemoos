import { FaSlack, FaGoogleDrive, FaGithub, FaJira, FaConfluence } from 'react-icons/fa'
import { SiNotion } from 'react-icons/si'

export default function LogosBand() {
  const tools = [
    { name: 'Slack', icon: FaSlack },
    { name: 'Notion', icon: SiNotion },
    { name: 'Drive', icon: FaGoogleDrive },
    { name: 'GitHub', icon: FaGithub },
    { name: 'Jira', icon: FaJira },
    { name: 'Confluence', icon: FaConfluence },
  ]

  return (
    <section className="wrap">
      <div className="logos">
        <div className="logos-label">Built for the tools your team already lives in</div>
        <div className="logos-marquee">
          <div className="logos-row">
            {tools.map(t => (
              <div key={t.name} className="l">
                <t.icon className="icon" />
                {t.name}
              </div>
            ))}
          </div>
          <div className="logos-row" aria-hidden="true">
            {tools.map(t => (
              <div key={t.name} className="l">
                <t.icon className="icon" />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
