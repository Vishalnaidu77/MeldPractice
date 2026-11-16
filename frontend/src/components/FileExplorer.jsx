import Icon from './Icon'

function fileType(path) {
  const extension = path.split('.').pop()?.toLowerCase()
  if (['jsx', 'tsx', 'js', 'ts'].includes(extension)) return 'js'
  if (['css', 'scss'].includes(extension)) return 'css'
  if (extension === 'json') return 'json'
  if (extension === 'md') return 'md'
  return 'file'
}

export default function FileExplorer({ sandbox, files, selectedFile, onSelectFile, onRefresh }) {
  return <aside className="files-sidebar">
    <div className="side-heading"><div><Icon name="folder" size={16}/><span>Explorer</span></div><button className="icon-button subtle" title="Refresh files" onClick={onRefresh}><Icon name="refresh" size={15}/></button></div>
    <div className="project-root"><span className="root-chevron">⌄</span><span className="root-folder"/><span>{sandbox ? 'workspace' : 'your-project'}</span></div>
    {sandbox ? <div className="file-list">{files.map((file) => {
      const type = fileType(file)
      return <button className={`file-row ${selectedFile === file ? 'selected' : ''}`} key={file} onClick={() => onSelectFile(file)} title={file}>
        <span className={`file-type ${type}`}>{type === 'js' ? 'JS' : type === 'css' ? '#' : type === 'json' ? '{}' : type === 'md' ? 'M' : '·'}</span><span>{file.split('/').at(-1)}</span>
      </button>
    })}</div> : <div className="empty-files"><span className="empty-folder"><Icon name="folder" size={20}/></span><p>Your project files<br/>will show up here.</p></div>}
    <div className="sidebar-footer"><span className="footer-avatar">✳</span><div><strong>AI workspace</strong><small>Built for your next idea</small></div><span className="footer-dots">···</span></div>
  </aside>
}
