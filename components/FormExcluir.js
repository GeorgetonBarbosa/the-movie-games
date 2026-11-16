'use client';

// botão de excluir com confirmação
export default function FormExcluir({ action, campos, texto = 'Excluir', mensagem = 'Tem certeza?' }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(mensagem)) e.preventDefault();
      }}
      style={{ display: 'inline' }}
    >
      {Object.entries(campos).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button className="linkbtn">{texto}</button>
    </form>
  );
}
