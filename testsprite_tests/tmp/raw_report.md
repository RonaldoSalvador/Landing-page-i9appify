
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** I9Appify_SaaS_Central
- **Date:** 2026-03-20
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Login bem-sucedido redireciona para o Dashboard do CRM
- **Test Code:** [TC001_Login_bem_sucedido_redireciona_para_o_Dashboard_do_CRM.py](./TC001_Login_bem_sucedido_redireciona_para_o_Dashboard_do_CRM.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- SPA did not render; page returned 0 interactive elements and appears blank, preventing the login flow.
- 'Entrar' text not found on the page; login form is not available.
- Email and password input fields are not present, so credentials cannot be entered.
- Unable to verify redirect to '/crm' or presence of 'Dashboard' because the login could not be performed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/0709de7e-38a0-44d5-bfb2-a8df0c1a119f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Login com credenciais inválidas exibe erro no formulário
- **Test Code:** [TC002_Login_com_credenciais_invlidas_exibe_erro_no_formulrio.py](./TC002_Login_com_credenciais_invlidas_exibe_erro_no_formulrio.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- ASSERTION: Login form not found on page (no email/password inputs or 'Entrar' button present).
- ASSERTION: Page displays 0 interactive elements, preventing execution of test steps.
- ASSERTION: SPA content did not render at URL http://localhost:5173/ (blank page observed).
- ASSERTION: Unable to verify that invalid credentials do not redirect or that an error message is shown because the form is not present.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/98427d8a-f645-4633-96ce-c5d4049ee59e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Senha incorreta para usuário existente exibe erro de autenticação
- **Test Code:** [TC005_Senha_incorreta_para_usurio_existente_exibe_erro_de_autenticao.py](./TC005_Senha_incorreta_para_usurio_existente_exibe_erro_de_autenticao.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Expected error message containing 'inválid' not found on the page after submitting incorrect password.
- No visible error banner or inline validation indicating invalid credentials appeared after the login attempt.
- Only a loading indicator/text ('Entrando...') was visible instead of an error message, so the UI did not present the expected feedback.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/a251f882-1f75-42b2-afe5-7d6bf0c994b5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Acessar o CRM Dashboard e ver métricas e leads recentes carregados
- **Test Code:** [TC008_Acessar_o_CRM_Dashboard_e_ver_mtricas_e_leads_recentes_carregados.py](./TC008_Acessar_o_CRM_Dashboard_e_ver_mtricas_e_leads_recentes_carregados.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/46ea83fa-ff0a-4467-b3dc-76f19d9a6c08
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Abrir detalhes de um lead a partir dos leads recentes
- **Test Code:** [TC009_Abrir_detalhes_de_um_lead_a_partir_dos_leads_recentes.py](./TC009_Abrir_detalhes_de_um_lead_a_partir_dos_leads_recentes.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/95197ffc-9b13-4797-879e-9a3d3fd44862
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Enviar mensagem em uma conversa e ver a mensagem aparecer no histórico local
- **Test Code:** [TC012_Enviar_mensagem_em_uma_conversa_e_ver_a_mensagem_aparecer_no_histrico_local.py](./TC012_Enviar_mensagem_em_uma_conversa_e_ver_a_mensagem_aparecer_no_histrico_local.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Message input field not found on conversation page; sending messages is not possible.
- No interactive input element or Send button is present in the conversation pane's interactive elements.
- Conversation pane remains in placeholder state ('Selecione uma conversa...') or selection does not reveal a messages input area consistently.
- Multiple remediation attempts performed (open different conversations, refresh, pause IA, scroll) did not reveal the input, so the feature is not usable in this environment.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/70c52327-fe08-4941-98bb-2bcddd9e77ec
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Indicador de sincronização pendente ao enviar mensagem (limitação de tempo real)
- **Test Code:** [TC013_Indicador_de_sincronizao_pendente_ao_enviar_mensagem_limitao_de_tempo_real.py](./TC013_Indicador_de_sincronizao_pendente_ao_enviar_mensagem_limitao_de_tempo_real.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Composer (message input) not found in the conversation view; message cannot be composed or sent.
- Send button or equivalent message-submit control not present or accessible; message cannot be delivered from the UI.
- Message 'Mensagem de teste - pendente sync' could not be posted or verified because the composer was not available.
- No UI indicator containing the text 'sincron' was found; pending synchronization state cannot be verified.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/59f9ef16-4900-4b2a-9ff2-4da67e820530
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Tentar enviar mensagem vazia não deve adicionar mensagem ao histórico
- **Test Code:** [TC015_Tentar_enviar_mensagem_vazia_no_deve_adicionar_mensagem_ao_histrico.py](./TC015_Tentar_enviar_mensagem_vazia_no_deve_adicionar_mensagem_ao_histrico.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Conversations page (/crm/atendimentos) loaded but rendered a blank page with 0 interactive elements; required UI for the test is not present.
- Message input field not found on the page, so sending a blank message cannot be attempted or observed.
- Send button not found on the page, preventing triggering of message submission.
- Texts 'Mensagem' and 'obrigat' cannot be verified because the page content did not render.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/62f47e82-a37e-4a51-891e-db7bef44da19
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Criar novo canal WhatsApp (Evolution API) com credenciais válidas
- **Test Code:** [TC018_Criar_novo_canal_WhatsApp_Evolution_API_com_credenciais_vlidas.py](./TC018_Criar_novo_canal_WhatsApp_Evolution_API_com_credenciais_vlidas.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Evolution API channel creation not completed: 'Criar Canal' (save) was never clicked.
- Evolution API form entries were repeatedly lost/cleared when the modal was reopened, preventing a successful save.
- No newly created Evolution API channel is present in the channels list after attempted creations.
- Multiple modal reopenings and form resets prevented completing the create-and-verify flow during this session.
- The end-to-end creation and listing of an Evolution API channel could not be demonstrated in this session.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/445fb33f-9194-4a6d-a0bf-5b8fa6715758
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Salvar canal Evolution API e ver confirmação de criação
- **Test Code:** [TC019_Salvar_canal_Evolution_API_e_ver_confirmao_de_criao.py](./TC019_Salvar_canal_Evolution_API_e_ver_confirmao_de_criao.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- CRM page did not render after navigation/clicks; page displays blank with 0 interactive elements.
- Unable to click 'Canais' - element not found or not interactable, preventing navigation to channel management.
- Could not perform 'Adicionar Canal', 'Select Evolution API', or 'Salvar' because CRM UI is unavailable.
- SPA intermittently rendered earlier but currently fails to render the channel management UI, blocking verification of visible feedback after saving.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/433a1a5b-db88-4566-a9b8-11a75007ded4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Tentar adicionar canal com credenciais incompletas e ver erro de validação
- **Test Code:** [TC020_Tentar_adicionar_canal_com_credenciais_incompletas_e_ver_erro_de_validao.py](./TC020_Tentar_adicionar_canal_com_credenciais_incompletas_e_ver_erro_de_validao.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Criar Canal (Salvar) button not clickable - click attempts on elements with indices 3085, 3463 and 4130 failed with 'element not interactable / stale'.
- Validation message 'erro' was not observed because the save action could not be performed.
- Cookie consent banner initially overlapped UI and likely contributed to earlier failures; it was dismissed but save clicks still failed afterwards.
- The SPA intermittently produced blank/stale UI which prevented completing the verification of the required-field validation.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/e6f05d7c-fcaa-4d30-94d0-708a60402c99
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Tentar adicionar canal com credenciais inválidas e ver mensagem de falha ao salvar
- **Test Code:** [TC021_Tentar_adicionar_canal_com_credenciais_invlidas_e_ver_mensagem_de_falha_ao_salvar.py](./TC021_Tentar_adicionar_canal_com_credenciais_invlidas_e_ver_mensagem_de_falha_ao_salvar.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- SPA did not render: page returned 0 interactive elements and a blank screenshot.
- Login form not found on page: no email/password input fields or 'Entrar' button visible.
- Required channel-management UI elements (Canais, Adicionar Canal, API Key field, Salvar) are not present, preventing test execution.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/758ecaba-cde4-446e-875e-15a1a9bbfe23
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Editar prompt de um agente IA e salvar com sucesso
- **Test Code:** [TC024_Editar_prompt_de_um_agente_IA_e_salvar_com_sucesso.py](./TC024_Editar_prompt_de_um_agente_IA_e_salvar_com_sucesso.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No agent rows found on /crm/agentes — the agent grid displays 'Carregando agentes...' and there are zero items to configure.
- 'Configurar' button for the first agent is not present because there are no agents listed on the page.
- The test cannot proceed to edit the agent prompt and save because there is no existing agent to open the configuration for.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/9c014370-e8a5-4fa4-8a65-2ebfa85fcd9c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Validação: tentar salvar prompt vazio deve exibir erro
- **Test Code:** [TC026_Validao_tentar_salvar_prompt_vazio_deve_exibir_erro.py](./TC026_Validao_tentar_salvar_prompt_vazio_deve_exibir_erro.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No agents found on the Agents page: the UI displays 'Nenhum agente encontrado', so there is no agent to open and configure.
- 'Configurar' action for a first agent cannot be executed because the agents list is empty.
- The configuration modal could not be opened, therefore the Prompt field could not be cleared or edited.
- The validation message 'Campo obrigatório' could not be verified because the modal and form were not accessible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/cff54ebc-b0bd-47f9-b02d-3d337d088b9e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Restaurar prompt após apagá-lo e salvar com sucesso
- **Test Code:** [TC028_Restaurar_prompt_aps_apag_lo_e_salvar_com_sucesso.py](./TC028_Restaurar_prompt_aps_apag_lo_e_salvar_com_sucesso.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- SPA root at http://localhost:5173/ returned a blank page with 0 interactive elements.
- CRM navigation and agent configuration UI elements are not present on the page, preventing continuation of the test steps.
- Required UI for restoring/saving the prompt is unavailable, so the restore/save workflow cannot be validated.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/03765c0c-f4e1-401e-8f08-2d7db79aa1d9/d2d94156-354e-43ca-b26c-b86bf54914f6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **13.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---