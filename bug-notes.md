# Bug: Personalidade LLM se perde ao acessar perfil pela segunda vez

## Investigação

1. O campo "Personalidade para LLM" está vazio no formulário de edição do Mackinder
2. Porém os outros campos (personalityTraits, writingStyle, analysisApproach, keyPhrases) estão preenchidos
3. O campo `personality` é carregado de `counselorConfigs` na função `openEditDialog`:
   ```tsx
   const config = counselorConfigs.data?.find(c => c.counselorId === counselor.counselorId);
   personality: config?.personality || "",
   ```

4. O problema: quando o autoFill gera dados, ele preenche `formData.personality` com `data.llmPersonality`
5. Ao salvar, a função `handleSubmit` chama `updateCounselorPersonality` separadamente
6. MAS: ao criar um novo conselheiro (`createCounselor`), a personality NÃO é salva!

## Causa Raiz

Na função `handleSubmit`:
```tsx
if (editingId) {
  await updateCounselor.mutateAsync({ id: editingId, ...counselorData });
  // Update personality separately
  if (personality !== undefined) {
    await updateCounselorPersonality.mutateAsync({
      counselorId: formData.counselorId,
      personality: personality || null,
    });
  }
} else {
  await createCounselor.mutateAsync(counselorData);
  // PROBLEMA: personality NÃO é salva ao criar novo conselheiro!
}
```

## Solução

Adicionar chamada para `updateCounselorPersonality` também no caso de criação de novo conselheiro.
