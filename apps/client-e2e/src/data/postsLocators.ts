export const postsLocators ={
    cancelBtnLocator:'button:has-text("Cancel")',
    closeBtnLocator:'button:has(svg.lucide-x)',
    titleInputLocator:'input[name="title"]',
    ContentInputLocator:'textarea[name="content"]',
    CreatePostBtnLocator:'button[type="submit"]',
    titlePostTxtLocator:'div[role="article"] h3.text-2xl',
    contentPostTxtLocator:'p[class="whitespace-pre-wrap"]',
    userNamePostTxtLocator:'div.flex.items-center.gap-2 svg.lucide-user + span',
    favoriteBookPostTxtLocator: 'div.text-sm.mt-1 span:nth-of-type(2)',
    CreatedDatePostTxtLocator: 'div.text-sm.mt-1 >>nth=1',
    editBtnLocator:'button.edit-button',
    deleteBtnLocator:'button.delete-button'
}