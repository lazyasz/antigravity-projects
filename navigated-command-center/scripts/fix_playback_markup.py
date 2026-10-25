from pathlib import Path
p = Path('/home/ubuntu/navigated-command/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('<Sparkles size={14} /></div><EtaHistoryChart', '<Sparkles size={14} /></div></div><EtaHistoryChart')
p.write_text(s)
