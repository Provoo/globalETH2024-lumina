import React from 'react'
import { ChevronLeft, MoreVertical, Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Component() {
  const data = {
    "id": "a3e6fe40-7b29-4f1f-9ad0-ff09f304ead1",
    "created_at": "2024-10-19T10:23:01.518668Z",
    "structured": {
      "title": "Testing Webhook Site",
      "overview": "A speaker is attempting to test a webhook site and is checking if they are being heard.",
      "emoji": "ð\u009f\u0094§",
      "category": "technology",
      "actionItems": ["Test the webhook site connectivity and functionality."],
      "events": []
    },
    "started_at": "2024-10-19T10:23:01.518668Z",
    "finished_at": "2024-10-19T10:23:13.133455Z",
    "transcript_segments": [
      {
        "text": "Good. Hello? Hello? Do you hear me? I need to test, webhook site.",
        "speaker": "SPEAKER_0",
        "speaker_id": 0,
        "is_user": false,
        "start": 0,
        "end": 8.94
      }
    ],
    "plugins_results": [
      {
        "pluginId": "insight-extractor",
        "content": "Key Insights:\n- The speaker is attempting to test a webhook site, indicating a focus on technology or software functionality.\n- There is a need for communication clarity, as the speaker is confirming whether they can be heard.\n\nLatent Information:\n- The speaker may be involved in a project that requires testing webhooks, which are essential for server communication in various applications.\n- There could be a potential urgency or importance behind the test, as indicated by the need to confirm sound and connection.\n\nPotential Biases:\n- The speaker might be assuming that the listener is familiar with webhooks and their significance, which could lead to misunderstandings if the listener lacks technical knowledge.\n\nBlind Spots:\n- The conversation lacks context about the specific goals of the webhook test, such as the desired outcomes or the implications of the test results.\n- There may be underlying technical issues or challenges that the speaker is not addressing, such as connectivity issues or platform compatibility.\n\nRecommendations:\n- Clarify the objectives of the webhook testing to ensure all parties understand the purpose and importance.\n- Consider providing background information on webhooks for those who may not be familiar with the concept.\n- Check technical setups (e.g., sound, connection) prior to the test to minimize communication issues during important tasks."
      },
      {
        "pluginId": "speech-coach",
        "content": "1. Ensure clarity in your speech: Start with a clear greeting and introduction to set the context for your audience.\n\n2. Avoid filler phrases: Instead of saying \"Hello? Hello?\" consider stating your name or the purpose of your communication to maintain engagement.\n\n3. Use a confident tone: Practice speaking with assurance, even when testing technology or connections, to instill confidence in your audience.\n\n4. Structure your message: Clearly outline what you need to communicate, such as the purpose of the test and any specific details, to keep your audience informed.\n\n5. Practice active listening: If you are unsure whether others can hear you, pause and listen for their responses before continuing, ensuring a two-way communication flow."
      }
    ],
    "geolocation": null,
    "photos": [],
    "discarded": false,
    "deleted": false,
    "source": "MemorySource.friend",
    "language": "en",
    "external_data": null,
    "status": "completed"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  const startDate = formatDate(data.started_at)
  const endDate = formatDate(data.finished_at)

  return (
    <div className="bg-black text-white min-h-screen p-4 font-sans">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="text-sm">9:54</div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-6 w-6" />
        </Button>
      </div>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">
          {/* Transcript content would go here */}
        </TabsContent>
        <TabsContent value="summary">
          <h1 className="text-4xl font-bold mb-2">{data.structured.title}</h1>
          <p className="text-gray-400 mb-4">{startDate} to {endDate}</p>
          
          <Badge variant="secondary" className="mb-6">
            {data.structured.category}
          </Badge>

          <h2 className="text-2xl font-semibold mb-2">Overview</h2>
          <p className="text-gray-300 mb-6">{data.structured.overview}</p>

          <h2 className="text-2xl font-semibold mb-2 flex items-center">
            Action Items
            <Button variant="ghost" size="icon" className="ml-2">
              <Copy className="h-4 w-4" />
            </Button>
          </h2>
          <ul className="list-disc list-inside text-gray-300">
            {data.structured.actionItems.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  )
}