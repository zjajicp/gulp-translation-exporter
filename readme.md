#GULP TRANSLATION EXPORTER (AUTOMATIZED TRANSLATION PROCEDURE)
--------------------------

Automatizing translation(sending text for internationalization) workflow for Ryanair.

For purposes of sending JIRA translation tickets based on feature-keys.json you can use "gulp export-translations" command.

All you need to do is to make sure that "feature-keys.json" contains only translations related to your team and your sprint.
In other words please make sure it contains only needed translations.

When you are ready, run the "gulp export-translations" command from your command line and fallow the instructions.

HINTS:
      - "Code change required": asks if it is necessary for the translations that code changes are first deployed
         before they get published in global dictionary (it's up to you to realize this, though it most cases the answer is NO).

      - "Text position on web site": asks you to enter short description where the text resides inside the app (eg. rooms search widget)


The translation exporter will accommodate all the rules described there and allow you fast and simple ticket creation based
on what you have in "feature-keys", never thinking again how it should be done.

I know, it feels good ;)