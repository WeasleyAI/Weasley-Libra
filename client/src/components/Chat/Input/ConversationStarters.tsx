import { useMemo, useCallback } from 'react';
import { EModelEndpoint, Constants } from 'librechat-data-provider';
import { useChatContext, useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useGetAssistantDocsQuery, useGetEndpointsQuery } from '~/data-provider';
import { getIconEndpoint, getEntity } from '~/utils';
import { useSubmitMessage, useLocalize } from '~/hooks';
import { useChatFormContext } from '~/Providers';

const ConversationStarters = () => {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { setValue } = useChatFormContext();
  const localize = useLocalize();

  const endpointType = useMemo(() => {
    let ep = conversation?.endpoint ?? '';
    if (
      [
        EModelEndpoint.chatGPTBrowser,
        EModelEndpoint.azureOpenAI,
        EModelEndpoint.gptPlugins,
      ].includes(ep as EModelEndpoint)
    ) {
      ep = EModelEndpoint.openAI;
    }
    return getIconEndpoint({
      endpointsConfig,
      iconURL: conversation?.iconURL,
      endpoint: ep,
    });
  }, [conversation?.endpoint, conversation?.iconURL, endpointsConfig]);

  const { data: documentsMap = new Map() } = useGetAssistantDocsQuery(endpointType, {
    select: (data) => new Map(data.map((dbA) => [dbA.assistant_id, dbA])),
  });

  const { entity, isAgent } = getEntity({
    endpoint: endpointType,
    agentsMap,
    assistantMap,
    agent_id: conversation?.agent_id,
    assistant_id: conversation?.assistant_id,
  });

  // Default sample prompts for new chats
  const defaultSamplePrompts = useMemo(() => [
    localize('com_sample_prompts_latest_leads'),
    localize('com_sample_prompts_create_contact'),
    localize('com_sample_prompts_support_cases'),
    localize('com_sample_prompts_update_opportunity')
  ], [localize]);

  const conversation_starters = useMemo(() => {
    if (entity?.conversation_starters?.length) {
      return entity.conversation_starters;
    }

    if (isAgent) {
      return [];
    }

    const documentStarters = documentsMap.get(entity?.id ?? '')?.conversation_starters ?? [];
    if (documentStarters.length > 0) {
      return documentStarters;
    }

    // Return default sample prompts when no specific starters are available
    return defaultSamplePrompts;
  }, [documentsMap, isAgent, entity, defaultSamplePrompts]);

  const { submitMessage } = useSubmitMessage();
  
  const handleConversationStarterClick = useCallback(
    (text: string) => {
      // Fill the input field with the prompt text but don't send it
      setValue('text', text, { shouldValidate: true });
    },
    [setValue],
  );

  const sendConversationStarter = useCallback(
    (text: string) => submitMessage({ text }),
    [submitMessage],
  );

  if (!conversation_starters.length) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap justify-center gap-2 px-4">
      {conversation_starters
        .slice(0, Constants.MAX_CONVO_STARTERS)
        .map((text: string, index: number) => (
          <button
            key={index}
            onClick={() => handleConversationStarterClick(text)}
            className="relative flex w-48 flex-shrink-0 cursor-pointer flex-col gap-1 rounded-lg border border-border-medium px-3 py-2 text-start align-top text-[12px] shadow-sm transition-all duration-200 ease-in-out hover:bg-surface-tertiary hover:shadow-md"
          >
            <p className="break-words line-clamp-2 overflow-hidden text-balance text-text-secondary leading-tight">
              {text}
            </p>
          </button>
        ))}
    </div>
  );
};

export default ConversationStarters;
